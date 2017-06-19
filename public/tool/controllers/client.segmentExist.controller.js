angular.module('phive')
    .controller('segmentExistController', ['$scope', '$uibModalInstance','data','getMessage', segmentExistController]);

function segmentExistController($scope, $uibModalInstance,data,getMessage) {
    // $scope.m1= false;
    var nameExistingSegment = data;
    $scope.segmentMsg = 'Segment "'+nameExistingSegment+' "'+getMessage.GetData('segment_exist_msg');
    // console.log(localOffset);
    // $scope.userTimeZone = localOffset.toString(); 
    $scope.ok = function () {
        $uibModalInstance.close(true);
    };
    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    }
} 