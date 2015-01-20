angular.module('plotting', [])
// This service is pulled from 
.factory('d3service', function () {
    return window.d3;
})
.controller('plotdata', function($scope) {
    $scope.w = w;
    $scope.h = h;
    $scope.data = plotData;
})
.directive('plot', ['d3service', function (d3service) {
    var d3 = window.d3;

    return {
        restrict: 'EA',
        scope: {
            width: '=',
            height: '=',
            data: '='
        },
        link: function(scope, elm, attrs) {
            var w = scope.width;
            var h = scope.height;
            var p = 30;
            var svg = d3.select(elm[0])
                    .append("svg")
                    .attr("height", scope.height)
                    .attr("width", scope.width)
            var plotData = scope.data || [[-6,-1],[6,1]];
            // Set up the axes
            var xScale = d3.scale.linear().domain([-6,6]).range([p,w-p]);
            var yScale = d3.scale.linear().domain([-1,1]).range([h-p,p]);

            var xAxis = d3.svg.axis()
                .scale(xScale)
                .ticks(5)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(yScale)
                .ticks(5)
                .orient("left");

            // Draw the axes
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(0," + (h/2) + ")")
                .call(xAxis);
            svg.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + w/2 + ",0)")
                .call(yAxis);

            // I want a path... so...

            // This next bit creates an svg path generator
            var pathGen = d3.svg.line()
                .x(function(d) {return xScale(d[0]); })
                .y(function(d) {return yScale(d[1]); })
                .interpolate("linear");

            // Now, the plot is actually added to the svg
            var plot = svg.append("path")
                .attr("d", pathGen(plotData))
                .attr("stroke", "blue")
                .attr("stroke-width", 2)
                .attr("fill", "none");

        },
    };
}])
.directive('axes', function() {
    return {
        require: '^figure',
        restrict: 'EA',
        scope: {
            xRange: '=',
            yRange: '='
        },
        link: function(scope, element, attrs, figureCtrl) {
            figureCtrl.addPath(scope);
        },
    };
})
.directive('path', function() {
    return {
        require: '^figure',
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs, figureCtrl) {
            figureCtrl.addPath(scope);
        },
    };
})
;
