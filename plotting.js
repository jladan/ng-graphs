angular.module('plotting', [])

.factory('d3Service', function () {
    var d3;
    return d3;
})
.directive('figure', ['d3Service', function (d3Service) {

    return {
        restrict: 'EA',
        scope: {},
        controller: function($scope) {
            // This will likely need to be created in the link function
            $scope.svgElement;

            /* The following functions are to add things to the figure
             * such as paths, lines, circles, etc.
             */
            this.addAxes = function(path) {
                // Script to add path to SVG here
            };

            this.addPath = function(path) {
                // Script to add path to SVG here
            };
        },
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
            figureCtrl.addPath(scope);
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
