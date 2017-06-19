angular.module('phive')
    .controller('deleteCampaignModel', ['$scope', '$uibModalInstance','campName', deleteCampaignModel]);

function deleteCampaignModel($scope, $uibModalInstance,campName) {
    $scope.name=campName;
      $scope.ok = function () {
        $uibModalInstance.close(true);
    };
    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    }
} 