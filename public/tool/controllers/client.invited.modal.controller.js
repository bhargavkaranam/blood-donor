'use strict';
angular.module('phive')
    .controller('invitedModal', ['$scope', '$uibModalInstance', 'data', 'getMessage', invitedModal]);

function invitedModal($scope, $uibModalInstance, data, getMessage) {
    $scope.company = data.company;
    $scope.role = data.role;
    $scope.ok = function () {
        $uibModalInstance.close(true);
    };
    $scope.cancel = function () { 
        $uibModalInstance.close(false);
    }
    $scope.dismiss = function(){
        $uibModalInstance.dismiss();
    }
}