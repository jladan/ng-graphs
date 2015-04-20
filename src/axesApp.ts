/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />
/// <reference path="./axes.ts" />

interface IDataScope extends ng.IScope {
    chooseSine(samples?: number);
    chooseCosine(samples?: number);
    axesConfig: any;
    data: Array<[number, number]>;
}
class DataCtrl {
    constructor(private $scope: IDataScope) {
        // Functions to test out $watch on `data`
        $scope.chooseSine = function (samples) {
            var plotData = Array();
            var N = samples || 100;
            var i: number;
            for (i = 0; i <= N; i++) {
                var x = 12 * i / N - 6;
                plotData.push([x, Math.sin(x)]);
            }
            $scope.data = plotData;
        };

        $scope.chooseCosine = function (samples) {
            var plotData = Array();
            var N = samples || 100;
            var i: number;
            for (i = 0; i <= N; i++) {
                var x = 12 * i / N - 6;
                plotData.push([x, Math.cos(x)]);
            }
            $scope.data = plotData;
        };

        $scope.chooseSine();

        $scope.axesConfig = {
            xDomain: [-6, 6],
            yDomain: [-1, 1],
            xLabel: "this is a label for the X axis",
            yLabel: "this is a label for the Y axis",
        }
    }
}

angular.module('plottingApp', [])
    .controller('axesData', DataCtrl)
    .directive('axes', ngPlot.axesDirective)
    .directive('line', ngPlot.lineDirective)
    .directive('plot', ngPlot.plotDirective)
;
