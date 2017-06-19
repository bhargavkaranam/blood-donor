angular.module('phive')
    .controller('registerAdminController', ['$scope', '$state', 'currentAuth', 'getEmailId', registerAdminController]);

function registerAdminController($scope, $state, currentAuth, getEmailId) {

    $scope.auth = Auth;


    // any time auth status updates, add the user data to scope
    // $scope.auth.$onAuth(function (authData) {
    //     $scope.authData = authData;
    if (currentAuth === null) {
        $state.go('index');
    } else {
        // get hash ID  
             var controllerCode = function (ref, data) {
        };
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}