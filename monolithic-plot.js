angular.module('plotting', [])
// This service is pulled from 
.controller('plotdata', function($scope) {

    // Functions to test out $watch on `data`
    $scope.chooseSine = function (samples) {
        var plotData = Array();
        var N = samples || 100;
        for (i=0; i<=N; i++) {
            var x = 12*i/N - 6;
            plotData.push([x, Math.sin(x)]);
        }
        $scope.data = plotData;
    };

    $scope.chooseCosine = function (samples) {
        var plotData = Array();
        var N = samples || 100;
        for (i=0; i<=N; i++) {
            var x = 12*i/N - 6;
            plotData.push([x, Math.cos(x)]);
        }
        $scope.data = plotData;
    };

    $scope.chooseSine();

    $scope.plotConfig = {
        xDomain: [-6,6],
        yDomain: [-1,1],
    }

    $scope.changeDomain = function () {
        $scope.plotConfig = {
            xDomain: [-3,3],
            yDomain: [-1,1],
        };
    };


})
.directive('plot', function () {
    var d3 = window.d3;

    /* Sets the options for the plot, such as axis locations, range, etc...
     */
    var setOptions = function (scope, opts) {
        if (opts) {
            scope.xDomain = opts.xDomain || [-1,1];
            scope.yDomain = opts.yDomain || [-1,1];
        }
        else {
            scope.xDomain = [-1,1];
            scope.yDomain = [-1,1];
        }
    };

    return {
        restrict: 'EA',
        scope: {
            options: '=',
            data: '='
        },
        controller: ['$scope', function($scope) {
            $scope.drawAxes = function () {
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
                    .attr("transform", "translate(0," + ($scope.height-$scope.padding) + ")")
                    .call(xAxis);
                $scope.svg.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(" + $scope.padding + ",0)")
                    .call(yAxis);
            };

            $scope.render = function() {
                $scope.svg.selectAll('*').remove();
                var p = $scope.padding;
                var plotData = $scope.data || [[-6,-1],[6,1]];
                var w = $scope.width;
                var h = $scope.height;

                // Set up the scales
                $scope.xScale = d3.scale.linear()
                    .domain($scope.xDomain).range([p,w-p]);
                $scope.yScale = d3.scale.linear()
                    .domain($scope.yDomain).range([h-p,p]);

                $scope.drawAxes();

                // We want to clip the path to the drawing region
                var clip = $scope.svg.append("defs").append("clipPath")
                    .attr("id", "plotArea")
                    .append("rect")
                    .attr("id", "clip-rect")
                    .attr("x", $scope.padding)
                    .attr("y", $scope.padding)
                    .attr("width", $scope.width-$scope.padding*2)
                    .attr("height", $scope.height-$scope.padding*2)

                var chartBody = $scope.svg.append("g")
                    .attr("clip-path", "url(#plotArea)")

                // This next bit creates an svg path generator
                var pathGen = d3.svg.line()
                    .x(function(d) {return $scope.xScale(d[0]); })
                    .y(function(d) {return $scope.yScale(d[1]); })
                    .interpolate("linear");

                // Now, the plot is actually added to the svg
                $scope.plot = chartBody.append("path")
                    .attr("d", pathGen(plotData))
                    .attr("stroke", "blue")
                    .attr("stroke-width", 2)
                    .attr("fill", "none");
            };
            
            /* The following sets up watches for data, and config
             */
            $scope.$watch('options', function() {
                setOptions($scope, $scope.options);
                $scope.render();
            }, true);
            $scope.$watch('data', function() {
                $scope.render();
            });

            /* We create an apply function (so it can be removed),
             * and force an $apply on resize events, triggering 
             * the `$watch`s in the `link` function.
             */
            var apply = function () {$scope.$apply();};
            window.addEventListener('resize', apply);
        }],
        link: function(scope, elm, attrs) {

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
    };
})
;
