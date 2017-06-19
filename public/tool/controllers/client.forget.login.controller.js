var app = angular.module('phive');
app.controller('forgetlogincontroller', ['$scope', '$state', 'getFirebaseRef', forgetLoginController]);

function forgetLoginController($scope, $state, getFirebaseRef) {
    $scope.msg = "";
    $scope.result = false;
    $scope.resulClass = "";
    // any time auth status updates, add the user data to scope

    if (localStorage.getItem('widely::logoPath')) {
        $scope.logo = localStorage.getItem('widely::logoPath');
    } else {
        $scope.logo = "assets/img/logo.png";
    }
    
    $scope.generatePassword = function () {
        $scope.load = true;
        var ref = getFirebaseRef.ref;
        var email = $scope.user.email;
        if (typeof (email) !== "undefined") {
            ref.resetPassword({
                email: email
            }, function (error) {
                if (error) {
                    $scope.resulClass = "callout-danger";
                    $scope.$apply(function () {
                        switch (error.code) {
                            case "INVALID_USER":
                                $scope.load = false;
                                $scope.msg = error.message;
                                break;
                            default:
                                $scope.load = false;
                                $scope.msg = "Error resetting password:", error;
                        }
                    })
                } else {
                    $state.go("resetPassword");
                }
            });
        }
    }
}