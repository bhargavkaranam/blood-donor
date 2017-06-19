angular.module('phive')
    .controller('welcomeTour', ['$scope', '$uibModalInstance','data', welcomeTour]);

function welcomeTour($scope, $uibModalInstance,data) {
    // $scope.m1= false;
    $scope.appSetting = data;
    var date = new Date();
    var localOffset = -date.getTimezoneOffset()/60;
    // console.log(localOffset);
    $scope.userTimeZone = localOffset.toString(); 
    $scope.submit = function (appsetting) {
        $uibModalInstance.close(appsetting);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }
} 