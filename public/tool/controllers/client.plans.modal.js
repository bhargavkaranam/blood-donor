'use strict';

angular.module('phive').controller('upgradeModal', ['$scope', '$uibModalInstance', 'data', 'getMessage', upgradeModal]);

function upgradeModal($scope, $uibModalInstance, data, getMessage) {
    
    $scope.packageName = data.packageName;
    $scope.isUpgrade = data.isUpgrade;
    if ($scope.isUpgrade) {
        var msg = getMessage.GetData('plan_upgrade_modal');
        $scope.msg2 = 'you still have ' + data.dataLeft + ' data points left.';
        $scope.msg1 = msg;
    }
    if (!$scope.isUpgrade) {
        var msg = getMessage.GetData('plan_downgrade_modal');
        $scope.msg1 = msg;
    }
    console.log(data);
    $scope.ok = function () {
        $uibModalInstance.close(true);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}