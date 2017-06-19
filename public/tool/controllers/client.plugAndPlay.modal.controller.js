angular.module('phive')
    .controller('plugModalController', ['$scope', '$uibModalInstance','data', plugModalController]);

function plugModalController($scope, $uibModalInstance,data) {
    $scope.Url = data.url;
      $scope.ok = function () {
        $uibModalInstance.close(true);
    };
    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    }
} 