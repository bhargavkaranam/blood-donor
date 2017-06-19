angular.module('phive')
    .controller('deactivateAcc', ['$scope', '$uibModalInstance', deactivateAcc]);

function deactivateAcc($scope, $uibModalInstance) {
      $scope.ok = function () {
        $uibModalInstance.close(true);
    };
    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    }
} 