/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />

module ngGraphs {

    export type Range =[number, number];
    type DrawFunction = (svg: D3.Selection, 
                         xScale: D3.Scale.QuantitativeScale,
                         yScale: D3.Scale.QuantitativeScale,
                         axes?: AxesCtrl) => D3.Selection;

    interface Drawable {
        draw:   DrawFunction;
        xRange: () => Range;
        yRange: (axes: AxesCtrl) => Range;
    }
    export interface AxesConfig {
        xDomain?: Range;
        yDomain?: Range;
        xLabel?:  string;
        yLabel?:  string;
    }
    interface IAxesScope extends ng.IScope {
        mv: AxesCtrl;
        options: AxesConfig;
        // XXX The following need to be in the scope, because they are set/used
        // in the linking function
        width: number;
        height: number;
        svg: D3.Selection;
        render(): any;
    }
    class AxesCtrl {
        drawingRegion: D3.Selection;
        xDomain: Range;
        yDomain: Range;
        xScale: D3.Scale.LinearScale;
        yScale: D3.Scale.LinearScale;
        padding: number[];
        xLabel: string;
        yLabel: string;

        constructor(private $scope: IAxesScope) {
            $scope.mv = this;
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
            var p = this.padding;
            var w = $scope.width - (p[1]+p[3]);
            var h = $scope.height - (p[0]+p[2]);

            // Set up the scales
            this.xScale = d3.scale.linear()
                .domain(this.xDomain).range([p[3], w + p[3]]);
            this.yScale = d3.scale.linear()
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
                .attr("transform", "translate(0," + ($scope.height-this.padding[2]) + ")")
                .call(xAxis)
                .append("text").attr("class","label")
                .attr("style","text-anchor:middle")
                .attr("transform", "translate("+$scope.width/2+", "+(this.padding[2])+")")
                .text(this.xLabel || "");
            $scope.svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + this.padding[3] + ",0)")
                .call(yAxis)
                .append("text").attr("class","label")
                .attr("style","text-anchor:middle")
                .attr("transform", "translate("+ (-this.padding[3]+10)+", "+$scope.height/2+"),"
                                  +"rotate(-90)")
                .text(this.yLabel || "");

            // We want to clip the drawing region.
            var clip = $scope.svg.append("defs").append("clipPath")
                .attr("id", "plotArea")
                .append("rect")
                .attr("id", "clip-rect")
                .attr("x", this.padding[3])
                .attr("y", this.padding[0])
                .attr("width", $scope.width - this.padding[1] - this.padding[3])
                .attr("height", $scope.height - this.padding[0] - this.padding[2])

            this.drawingRegion = $scope.svg.append("g")
                .attr("clip-path", "url(#plotArea)")

        }

        /** Sets the options for the plot, such as axis locations, range, etc...
         */
        private setOptions(opts) {
            this.padding = [30,30,30,30] // top right bottom left
            if (opts) {
                this.xDomain = opts.xDomain || [-1, 1];
                this.yDomain = opts.yDomain || [-1, 1];
                this.xLabel = opts.xLabel || "";
                this.yLabel = opts.yLabel || "";
            }
            else {
                this.xDomain = [-1, 1];
                this.yDomain = [-1, 1];
                this.xLabel = "";
                this.yLabel = "";
            }
        }

        // Bits that handle all of the children of the plot
        children: DrawFunction[] = [];
        drawnElements: D3.Selection[] = [];
        
        addChild(drawFunction: DrawFunction) {
            return this.children.push(drawFunction) -1;
        }
        rmChild(index) {
            // XXX if we remove the child, we probably also want to undraw it
            this.undrawChild(index);
            delete this.children[index];
        }

        drawChild(index) {
            this.undrawChild(index);
            this.drawnElements[index] = 
                    this.children[index](this.drawingRegion, this.xScale, this.yScale, this);
        }
        
        reorderElements() {
            // Reorder the drawn elements
            var plot: Node = this.drawingRegion[0][0], tmp: Node[];
            for (var i in this.drawnElements) {
                tmp = this.drawnElements[i][0];
                for (var j=0; j<tmp.length; j++) {
                    //plot.removeChild(tmp[j]);
                    plot.appendChild(tmp[j]);
                }
            }
        }

        redrawChild(index) {
            this.drawChild(index);
            this.reorderElements();
        }

        drawChildren() {
            for (var i in this.children)
                this.drawChild(i);
        }

        undrawChild(index: number) {
            if (this.drawnElements[index]) {
                this.drawnElements[index].remove();
                delete this.drawnElements[index];
            }
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


    interface LineData {
        start:   [number, number];
        end:     [number, number];
        options: any;
    }
    interface ILineScope extends ng.IScope, LineData {}
    class Line implements Drawable {
        // XXX We may need to add functions to change line data if parts of `l` change.
        constructor(private l: LineData) { }

        draw(svg, xScale, yScale) {
            var l = this.l;
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
        
        xRange(): [number, number]{
            return [this.l.start[0], this.l.end[0]];
        }
        yRange(): [number, number] {
            return [this.l.start[1], this.l.end[1]];
        }
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
                var line = new Line(scope);
                var index = axesCtrl.addChild(line.draw.bind(line));
                // XXX Currently, there are no watches to handle changes to scope properties
            }
        };
    }

    interface PlotData {
        options: any;
        data?: any;
    }
    interface IPlotScope extends ng.IScope, PlotData {}
    class Plot implements Drawable {
        // XXX We may need to add functions to change line data if parts of `l` change.
        constructor(private plot: PlotData) {
            this.setData();
        }

        data: Array<[number, number]>;
        setData(axes?: AxesCtrl) {
            this.data = this.plot.data || [];
        }

        draw(svg, xScale, yScale, axes) {
            // XXX This ends up repeating the version for the line
            // except with different defaults
            var sw = this.plot.options.strokeWidth || 2;
            var color = this.plot.options.color || 'blue';

            // XXX Probably don't need to recalculate data on every draw.
            // However, this is here to ensure it is actually ready for every draw.
            // e.g. when the axes are resized
            this.setData(axes);

            // This next bit creates an svg path generator
            var pathGen = d3.svg.line()
                .x(function (d) { return xScale(d[0]); })
                .y(function (d) { return yScale(d[1]); })
                .interpolate("linear");

            // Now, the plot is actually added to the svg
            var path = svg.append("path")
                .attr("d", pathGen(this.data))
                .attr("stroke", color)
                .attr("stroke-width", sw)
                .attr("fill", "none");
            return path;
        }
        
        xRange(): [number, number]{
            // TODO Change to max/min of x-values
            return [0,0];
        }
        yRange(): [number, number] {
            // TODO Change to max/min of x-values
            return [0,0];
        }
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
                var plot = new Plot(scope);
                var index = axesCtrl.addChild(plot.draw.bind(plot));
                scope.$watch('options',  () => {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('data', function () {
                    axesCtrl.redrawChild(index);
                });
            },
        };
    }
    
    interface FuncData extends PlotData {
        f: (number) => number;
    }
    interface IFuncScope extends FuncData, ng.IScope { }
    class Func extends Plot {
        // XXX We may need to add functions to change line data if parts of `l` change.
        private f: (number) => number;
        constructor(f: FuncData) {
            this.f = f.f;
            super(f);
        }

        setData(axes?: AxesCtrl) {
            var domain: Range = [0, 1];
            var N: number = 100 // number of samples
            if (axes) {
                domain = axes.xDomain;
                var range = axes.xScale.range();
                N = Math.abs(range[0]-range[1]);
            }
            var N = 100;
            var plotData = Array();
            var i: number;
            for (i = 0; i <= N; i++) {
                var x = (domain[1]-domain[0]) * i / N + domain[0];
                plotData.push([x, this.f(x)]);
            }
            this.data = plotData;
        }

        xRange(): [number, number]{
            // XXX doesn't make any sense for functions
            return [0,0];
        }
        yRange(): [number, number] {
            // TODO it's a good idea, but depends on the xDomain of the axes in this case
            return [0,0];
        }
    }
    export function functionDirective(): ng.IDirective {
        return {
            restrict: 'E',
            require: "^axes",
            transclude: true,
            scope: {
                options: '=',
                f: '='
            },
            link: function (scope: IFuncScope, elm, attrs, axesCtrl: AxesCtrl) {
                var func = new Func(scope);
                var index = axesCtrl.addChild(func.draw.bind(func));
                scope.$watch('options',  () => {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('data', () => {
                    axesCtrl.redrawChild(index);
                });
            },
        };
    }

    export interface HistConfig {
        bins?:      number;
        frequency?: boolean;
    }
    interface HistData {
        options: HistConfig;
        data: number[];
    }
    interface IHistScope extends ng.IScope, HistData {}
    class Histogram implements Drawable {
        // XXX We may need to add functions to change line data if parts of `l` change.
        constructor(private hist: HistData) { }

        data: D3.Layout.Bin[]
        setData(axes: AxesCtrl) {
            var bins = this.hist.options.bins || 10;
            this.data = d3.layout.histogram()
                    .frequency(!!this.hist.options.frequency)
                    .range(axes.xDomain)
                    .bins(axes.xScale.ticks(bins))(this.hist.data);
        }

        draw(svg, xScale, yScale, axes: AxesCtrl) {

            this.setData(axes);

            var h: D3.Selection = svg.append('g')
            var bar = h.selectAll(".bar")
                .data(this.data).enter().append("g")
                .attr("class", "bar")
                .attr("transform", (d) => {
                    return "translate(" + xScale(d.x) + "," +
                        yScale(d.y) + ")"
                });

            bar.append("rect").attr("x", 1)
                .attr("width",(d) => { return xScale(d.x+d.dx)-xScale(d.x); })
                .attr("height",(d) => { return yScale(0)-yScale(d.y); })

            return h;
        }
        
        xRange(): [number, number]{
            // TODO return max and min of this.hist.data
            return [0,0];
        }
        yRange(axes: AxesCtrl): [number, number] {
            this.setData(axes);
            // TODO return max value of hist[i].y
            return [0,0];
        }
    }
    export function histogramDirective(): ng.IDirective {
        return {
            restrict: 'E',
            require: "^axes",
            transclude: true,
            scope: {
                options: '=',
                data: '='
            },
            link: function (scope: IHistScope, elm, attrs, axesCtrl: AxesCtrl) {
                var histogram = new Histogram(scope);
                var index = axesCtrl.addChild(histogram.draw.bind(histogram));
                scope.$watch('options',  () => {
                    axesCtrl.redrawChild(index);
                }, true);
                scope.$watch('data', () => {
                    axesCtrl.redrawChild(index);
                });
            },
        };
    }

    angular.module('ngGraphs', [])
        .directive('axes', axesDirective)
        .directive('line', lineDirective)
        .directive('plot', plotDirective)
        .directive('function', functionDirective)
        .directive('histogram', histogramDirective)
}
