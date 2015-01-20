angular.module('plotting', [])

.factory('d3Service', function () {
    // TODO: determine a good way of doing this
    var d3;
    return d3;
})
.directive('figure', ['d3Service', function (d3Service) {
    var d3 = window.d3;

    return {
        restrict: 'EA',
        scope: {
            width: '=',
            height: '=',
        },
        controller: function($scope) {
            /* add a curve to the svg plot
             * plotData has to be an array of pairs [[x1,y1],[x2,y2]...]
             */
            this.addPath = function(plotData) {
                // Define the path generator with current scales
                var pathGen = d3.svg.line()
                    .x(function(d) {return $scope.xScale(d[0]); })
                    .y(function(d) {return $scope.yScale(d[1]); })
                    .interpolate("linear");

                // Now, the plot is actually added to the svg
                var plot = $scope.svg.append("path")
                    .attr("d", pathGen(plotData))
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("fill", "none");
            };

            this.addAxes = function(xDomain, yDomain) {
                // set up the scales
                $scope.xScale = d3.scale.linear()
                    .domain(xDomain).range(scope.xRange);
                $scope.xScale = d3.scale.linear()
                    .domain(xDomain).range(scope.xRange);

                // create the axis objects
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
                    .attr("transform", "translate(0," + (h/2) + ")")
                    .call(xAxis);
                $scope.svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + w/2 + ",0)")
                    .call(yAxis);

            };
        },
        link: function(scope, elm, attrs) {
            // Create the svg area that we'll draw in
            var scope.svg = d3.select(elm[0])
                    .append("svg")
                    .attr("height", scope.height)
                    .attr("width", scope.width)


        templateUrl: '/static/scripts/courseware/templates/uw-slide.html'
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
            figureCtrl.addAxes(xDomain, yDomain);
        },
        templateUrl: '/static/scripts/courseware/templates/uw-slide.html'
    };
}])
.directive('path', function() {
    return {
        require: '^figure',
        restrict: 'EA',
        scope: {},
        link: function(scope, element, attrs, figureCtrl) {
            figureCtrl.addPath(scope);
        },
        templateUrl: '/static/scripts/courseware/templates/uw-slide.html'
    };
}])
;
