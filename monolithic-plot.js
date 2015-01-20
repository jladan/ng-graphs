angular.module('plotting', [])
// This service is pulled from 
.controller('plotdata', function($scope) {
    $scope.w = w;
    $scope.h = h;
    $scope.data = plotData;
})
.directive('plot', ['$window', function ($window) {
    var d3 = window.d3;

    var drawAxes = function (scope) {
        var xAxis = d3.svg.axis()
            .scale(scope.xScale)
            .ticks(5)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(scope.yScale)
            .ticks(5)
            .orient("left");

        // Draw the axes
        scope.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (scope.height/2) + ")")
            .call(xAxis);
        scope.svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + scope.width/2 + ",0)")
            .call(yAxis);
    };

    var render = function(scope) {
        scope.svg.selectAll('*').remove();
        var p = scope.padding;
        var plotData = scope.data || [[-6,-1],[6,1]];
        var w = scope.width;
        var h = scope.height;

        // Set up the scales
        scope.xScale = d3.scale.linear()
            .domain([-6,6]).range([p,w-p]);
        scope.yScale = d3.scale.linear()
            .domain([-1,1]).range([h-p,p]);

        drawAxes(scope);

        // This next bit creates an svg path generator
        var pathGen = d3.svg.line()
            .x(function(d) {return scope.xScale(d[0]); })
            .y(function(d) {return scope.yScale(d[1]); })
            .interpolate("linear");

        // Now, the plot is actually added to the svg
        var plot = scope.svg.append("path")
            .attr("d", pathGen(plotData))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
    }

    return {
        restrict: 'EA',
        scope: {
            options: '=',
            data: '='
        },
        link: function(scope, elm, attrs) {

            // TODO read plot options
            scope.padding = 30;
            scope.svg = d3.select(elm[0])
                    .append("svg")
                    .attr("height", '100%')
                    .attr("width", '100%');
            
            scope.width = elm[0].offsetWidth - scope.padding;
            scope.height = elm[0].offsetHeight - scope.padding;

            window.onresize = function () {
                scope.$apply();
            };

            scope.$watch(function () {
                return elm[0].offsetWidth;
                // return angular.element($window)[0].innerWidth;
            }, function () {
                scope.width = elm[0].offsetWidth - scope.padding;
                scope.height = elm[0].offsetHeight - scope.padding;
                render(scope);
            });
            scope.$watch(function () {
                return elm[0].offsetHeight;
            }, function () {
                scope.width = elm[0].offsetWidth - scope.padding;
                scope.height = elm[0].offsetHeight - scope.padding;
                render(scope);
            });

        },
    };
}])
;
