var app = angular.module('phive');
app.controller('userInsightController', ['$scope', 'currentAuth',userInsightController]);

// app.config(['ChartJsProvider', function (ChartJsProvider) {
//     // Configure all charts
//     ChartJsProvider.setOptions({
//       colours: ['#FF5252', '#FF8A80'],
//       responsive: false
//     });
//     // Configure all line charts
//     ChartJsProvider.setOptions('Line', {
//       datasetFill: false
//     });
//   }])
function userInsightController($scope,currentAuth) {
    $scope.load = true;

    // any time auth status updates, add the user data to scope
        if (currentAuth === null) {
            $state.go('index');
        } else {
            $scope.load = false;

            $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
            $scope.series = ['Series A', 'Series B'];
            $scope.data = [
                [65, 59, 80, 81, 56, 55, 40],
                [28, 48, 40, 19, 86, 27, 90]
            ];
            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };
            $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }, { yAxisID: 'y-axis-2' }];
            $scope.options = {
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                        },
                        {
                            id: 'y-axis-2',
                            type: 'linear',
                            display: true,
                            position: 'right'
                        }
                    ]
                }
            };
            $scope.labelsDoughnut = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
            $scope.dataDoughnut = [300, 500, 100];
            $scope.labelspolar = ["Download Sales", "In-Store Sales", "Mail-Order Sales", "Tele Sales", "Corporate Sales"];
            $scope.datapolar = [300, 500, 100, 40, 120];
        }
  //  });

}