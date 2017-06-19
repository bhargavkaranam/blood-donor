var app = angular.module('phive');
app.controller('setupFlowController', ['$scope', '$state', 'currentAuth', 'getEmailId', setupFlowController]);

function setupFlowController($scope, $state,currentAuth, getEmailId) {
    $scope.load = true;

    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var controllerCode = function (ref, data) {
         $scope.load = false;
         };
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}