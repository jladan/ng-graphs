/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />

module ngPlot {

    interface IAxesScope extends ng.IScope {
        options: any;
        width: number;
        height: number;
        padding: number[];
        xLabel: string;
        yLabel: string;
        svg: D3.Selection;
        xScale: D3.Scale.LinearScale;
        yScale: D3.Scale.LinearScale;

        render(): any;
    }
    class AxesCtrl {
        drawingRegion: D3.Selection;
        xDomain: [number, number];
        yDomain: [number, number];

        constructor(private $scope: IAxesScope) {
            // So that the watches in the link function can call for a re-render
            $scope.render = this.render.bind(this);

            // Update the appearance when the config changes
            $scope.$watch('config', $scope.render);

            /* We create an apply function (so it can be removed),
             * and force an $apply on resize events, triggering 
             * the `$watch`s in the `link` function.
             */
            var apply = function () { $scope.$apply(); };
            window.addEventListener('resize', apply);
        }
        
        /** The Main drawing function
         */
        render() {
            var $scope = this.$scope;
            this.setOptions(this.$scope.options);
            $scope.svg.selectAll('*').remove();
            var p = $scope.padding;
            var w = $scope.width - (p[1]+p[3]);
            var h = $scope.height - (p[0]+p[2]);

            // Set up the scales
            $scope.xScale = d3.scale.linear()
                .domain(this.xDomain).range([p[3], w + p[3]]);
            $scope.yScale = d3.scale.linear()
                .domain(this.yDomain).range([h + p[0], p[0]]);

            this.drawAxes();
            this.drawChildren();
        }


        /** Draw the axes onto the plot
         */
        drawAxes() {
            var $scope = this.$scope;
            // Define the axis functions
            var xAxis = d3.svg.axis()
                .scale($scope.xScale)
                .ticks(5)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale($scope.yScale)
                .ticks(5)
                .orient("left");

            // Draw the axes
            $scope.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + ($scope.height-$scope.padding[2]) + ")")
                .call(xAxis)
                .append("text").attr("class","label")
                .attr("style","text-anchor:middle")
                .attr("transform", "translate("+$scope.width/2+", "+($scope.padding[2])+")")
                .text($scope.xLabel || "");
            $scope.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + $scope.padding[3] + ",0)")
                .call(yAxis)
                .append("text").attr("class","label")
                .attr("style","text-anchor:middle")
                .attr("transform", "translate("+ (-$scope.padding[3]+10)+", "+$scope.height/2+"),"
                                  +"rotate(-90)")
                .text($scope.yLabel || "");

            // We want to clip the drawing region.
            var clip = $scope.svg.append("defs").append("clipPath")
                .attr("id", "plotArea")
                .append("rect")
                .attr("id", "clip-rect")
                .attr("x", $scope.padding[3])
                .attr("y", $scope.padding[0])
                .attr("width", $scope.width - $scope.padding[1] - $scope.padding[3])
                .attr("height", $scope.height - $scope.padding[0] - $scope.padding[2])

            this.drawingRegion = $scope.svg.append("g")
                .attr("clip-path", "url(#plotArea)")

        }

        /** Sets the options for the plot, such as axis locations, range, etc...
         */
        private setOptions(opts) {
            this.$scope.padding = [30,30,30,30] // top right bottom left
            if (opts) {
                this.xDomain = opts.xDomain || [-1, 1];
                this.yDomain = opts.yDomain || [-1, 1];
                this.$scope.xLabel = opts.xLabel || "";
                this.$scope.yLabel = opts.yLabel || "";
            }
            else {
                this.xDomain = [-1, 1];
                this.yDomain = [-1, 1];
                this.$scope.xLabel = "";
                this.$scope.yLabel = "";
            }
        }

        // Bits that handle all of the children of the plot
        children = [];
        
        addChild(drawFunction) {
            return this.children.push(drawFunction) -1;
        }
        rmChild(index) {
            delete this.children[index];
        }

        redrawChild(index) {
            // XXX for now, we're just re-rendering the whole thing
            this.render();
        }

        drawChildren() {
            for (var i in this.children)
                this.children[i](this.drawingRegion, this.$scope.xScale, this.$scope.yScale);
        }

    }
    export function axesDirective(): ng.IDirective {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                options: '=',
            },
            controller: AxesCtrl,
            link: function (scope: IAxesScope, elm, attrs) {
                scope.svg = d3.select(elm[0])
                    .append("svg")
                    .attr("height", '100%')
                    .attr("width", '100%');

                scope.width = elm[0].offsetWidth;
                scope.height = elm[0].offsetHeight;

                scope.$watch(function () {
                    return elm[0].offsetWidth;
                }, function () {
                        scope.width = elm[0].offsetWidth;
                        scope.height = elm[0].offsetHeight;
                        scope.render();
                    });
                scope.$watch(function () {
                    return elm[0].offsetHeight;
                }, function () {
                        scope.width = elm[0].offsetWidth;
                        scope.height = elm[0].offsetHeight;
                        scope.render();
                    });

            },
            template: '<div ng-transclude></div>',
        };
    }

    interface ILineScope extends ng.IScope {
        start:   [number, number];
        end:     [number, number];
        options: any;
    }
    function drawLine(l: ILineScope, svg, xScale, yScale) {
        var sw = l.options.strokeWidth || 1;
        var color = l.options.color || 'black';
        var start = l.start;
        var end = l.end;
        var drawnLine = svg.append("line")
            .attr("x1", xScale(start[0]))
            .attr("y1", yScale(start[1]))
            .attr("x2", xScale(end[0]))
            .attr("y2", yScale(end[1]))
            .attr('stroke-width', sw)
            .attr('stroke', color)
        return drawnLine;
    }
    export function lineDirective(): ng.IDirective {
        return {
            require: '^axes',
            restrict: 'E',
            scope: {
                start: '=',
                end: '=',
                options: '=',
            },
            link: function (scope: ILineScope, element, attrs, axesCtrl) {
                var index = axesCtrl.addChild(drawLine.bind(null, scope));
            }
        };
    }

    interface IPlotScope extends ng.IScope {
        options: any;
        data: any;
    }
    function drawPlot(plot: IPlotScope, svg, xScale, yScale) {
        // XXX This ends up repeating the version for the line
        // except with different defaults
        var sw = plot.options.strokeWidth || 2;
        var color = plot.options.color || 'blue';

        var plotData = plot.data || [];

        // This next bit creates an svg path generator
        var pathGen = d3.svg.line()
            .x(function (d) { return xScale(d[0]); })
            .y(function (d) { return yScale(d[1]); })
            .interpolate("linear");

        // Now, the plot is actually added to the svg
        svg.append("path")
            .attr("d", pathGen(plotData))
            .attr("stroke", color)
            .attr("stroke-width", sw)
            .attr("fill", "none");
    }
    export function plotDirective(): ng.IDirective {
        return {
            restrict: 'E',
            require: '^axes',
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            link: function (scope: IPlotScope, elm, attrs, axesCtrl) {
                var index = axesCtrl.addChild(drawPlot.bind(null, scope));
                scope.$watch('options',  () => {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('data', function () {
                    axesCtrl.redrawChild(index);
                });
            },
        };
    }

}
