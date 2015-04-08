/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />

module ngHist {

    interface IDataScope extends ng.IScope {
        histConfig: HistConfig;
        data: Array<number>;
        mv: DataCtrl;
        N: number;
    }
    export interface HistConfig {
        xDomain: Range;
        yDomain?: Range;
        xScale: string;
        yScale: string;
        bins?: number;
    }
    class DataCtrl {
        constructor(private $scope: IDataScope) {
            // Functions to test out $watch on `data`
            $scope.histConfig = {
                xDomain: [0, 1],
                xScale: 'linear',
                yScale: 'linear',
            }
            $scope.mv = this;
            $scope.N = 100;
            this.hatDist($scope.N);
        }
        hatDist(n: number) {
            var i;
            this.$scope.data = new Array(n)
            for (i=0; i<n; i++) {
                var tmp = Math.random() + Math.random();
                this.$scope.data[i] = tmp/2;
            }
        }
        moreDist(n: number) {
            var i;
            this.$scope.data = new Array(n)
            for (i=0; i<n; i++) {
                var j, tmp=0;
                for (j=0; j<10; j++)
                    tmp += Math.random();
                this.$scope.data[i] = tmp/10;
            }
        }
    }

    export type Range =[number, number];

    export interface IHistScope extends ng.IScope {
        mv: HistCtrl;
        options: any;
        data: any;
        width: number;
        height: number;
        padding: number;
        xDomain: [number, number];
        yDomain: [number, number];
        svg: D3.Selection;
        plot;

        render(): any;
        drawHist();
        drawAxes();
    }
    export class HistCtrl {
        hdata: D3.Layout.Bin[];
        xScale: D3.Scale.QuantitativeScale;
        yScale: D3.Scale.QuantitativeScale;
        xDomain: Range;
        yDomain: Range;
        bins: number;
        constructor(private $scope: IHistScope) {
            $scope.mv = this;
            // Things that need to be drawn
            $scope.drawAxes = () => {
                var xAxis = d3.svg.axis()
                    .scale(this.xScale)
                    .ticks(5)
                    .orient("bottom");
                var yAxis = d3.svg.axis()
                    .scale(this.yScale)
                    .ticks(5)
                    .orient("left");

                // Draw the axes
                $scope.svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + ($scope.height - $scope.padding) + ")")
                    .call(xAxis);
                $scope.svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + $scope.padding + ",0)")
                    .call(yAxis);
            };
            $scope.drawHist = () => {
                var chartBody = $scope.svg.append("g")
                    .attr("clip-path", "url(#plotArea)")

                // This next bit creates an svg path generator
                var pathGen = d3.svg.line()
                    .x(function (d) { return this.xScale(d[0]); })
                    .y(function (d) { return this.yScale(d[1]); })
                    .interpolate("linear");

                var bar = $scope.svg.selectAll(".bar")
                    .data(this.hdata).enter().append("g")
                    .attr("class", "bar")
                    .attr("transform",(d) => {
                        return "translate(" + this.xScale(d.x) + "," +
                            this.yScale(d.y) + ")"
                    });

                bar.append("rect").attr("x", 1)
                    .attr("width",(d) => { return this.xScale(d.x+d.dx)-this.xScale(d.x); })
                    .attr("height",(d) => { return this.yScale(0)-this.yScale(d.y); })
            };
            $scope.render = () => {
                $scope.svg.selectAll('*').remove();
                var p = $scope.padding;
                var w = $scope.width;
                var h = $scope.height;

                // Set up the scales
                this.xScale = d3.scale.linear()
                    .domain(this.xDomain).range([p, w - p]);
                this.yScale = d3.scale.linear()
                    .domain([0, d3.max(this.hdata,(d) => { return d.y; })])
                    .range([h - p, p]);

                $scope.drawAxes();
                $scope.drawHist();
            };

            /* The following sets up watches for data, and config
             */
            $scope.$watch('options',  () => {
                this.setOptions($scope.options);
                if (this.hdata) 
                    $scope.render();
            }, true);
            $scope.$watch('data', () => {
                this.hdata = d3.layout.histogram().range(this.xDomain).bins(this.xScale.ticks(this.bins))($scope.data);
                $scope.render();
            });

            /* We create an apply function (so it can be removed),
             * and force an $apply on resize events, triggering 
             * the `$watch`s in the `link` function.
             */
            var apply = function () { $scope.$apply(); };
            window.addEventListener('resize', apply);
        }

        private setOptions(opts) {
            if (opts) {
                this.xDomain = opts.xDomain || [-1, 1];
                this.yDomain = opts.yDomain;
                this.bins = opts.bins || 10;
            }
            else {
                this.xDomain = [-1, 1];
            }
            // The xScale is dependent on config more than data
            var p = this.$scope.padding;
            var w = this.$scope.width;
            this.xScale = d3.scale.linear()
                .domain(this.xDomain).range([p, w - p]);
        }

    }
    function histDirective(): ng.IDirective {
        /* Sets the options for the plot, such as axis locations, range, etc...
         */

        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            controller: HistCtrl,
            link: function (scope: IHistScope, elm, attrs) {

                // TODO read plot options
                scope.padding = 30;
                scope.svg = d3.select(elm[0])
                    .append("svg")
                    .attr("height", '100%')
                    .attr("width", '100%');

                scope.width = elm[0].offsetWidth - scope.padding;
                scope.height = elm[0].offsetHeight - scope.padding;

                scope.$watch(function () {
                    return elm[0].offsetWidth;
                }, function () {
                        scope.width = elm[0].offsetWidth - scope.padding;
                        scope.height = elm[0].offsetHeight - scope.padding;
                        scope.render();
                    });
                scope.$watch(function () {
                    return elm[0].offsetHeight;
                }, function () {
                        scope.width = elm[0].offsetWidth - scope.padding;
                        scope.height = elm[0].offsetHeight - scope.padding;
                        scope.render();
                    });

            },
            template: '<div ng-transclude></div>',
        };
    }

    angular.module('histogram', [])
    // This service is pulled from 
        .controller('histData', DataCtrl)
        .directive('histogram', histDirective)
    ;
}
