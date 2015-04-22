/// <reference path="../typings/angularjs/angular.d.ts" />
/// <reference path="../build/graphs.d.ts" />

interface IDataScope extends ng.IScope {
    mv: DataCtrl;

    chooseSine(samples?: number);
    chooseCosine(samples?: number);
    axesConfig: any;
    data: Array<[number, number]>;

    histConfig: any;
    histData: Array<number>;
    N: number;

    sine: (number) => number;
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

        $scope.sine = Math.sin;
        $scope.chooseSine();

        $scope.axesConfig = {
            xDomain: [-6, 6],
            yDomain: [-1, 1],
            xLabel: "this is a label for the X axis",
            yLabel: "this is a label for the Y axis",
        }

        $scope.histConfig = {
            xDomain: [-6, 6],
            yDomain: [0,1],
            bins: 20,
        }

        $scope.mv = this;
        this.hatDist(100);
        $scope.N = 100;
    }

    undrawChild(index: number) {
        this.$scope.data = [];
    }

    hatDist(n: number) {
        var i;
        this.$scope.histData = new Array(n)
        for (i=0; i<n; i++) {
            var tmp = Math.random() + Math.random();
            tmp = tmp*12
            this.$scope.histData[i] = tmp/2 -6;
        }
    }
    moreDist(n: number) {
        var i;
        this.$scope.histData = new Array(n)
        for (i=0; i<n; i++) {
            var j, tmp=0;
            for (j=0; j<10; j++)
                tmp += Math.random()*12 - 6;
            this.$scope.histData[i] = tmp/10;
        }
    }
}

angular.module('plottingApp', ['ngGraphs'])
    .controller('axesData', DataCtrl)
;
