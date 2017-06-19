var app = angular.module('phive');
app.controller('resetpasswordcontroller', ['$scope', '$state', 'getFirebaseRef','getMessage', resetPassword]);

function resetPassword($scope,$state,getFirebaseRef,getMessage) {
    $scope.msg = getMessage.GetData('reset_pass_mail_sent');
    $scope.resultClass = " phd-callout callout-success";
    $scope.load = false;
    // $scope.hide = false;
    // any time auth status updates, add the user data to scope

    if (localStorage.getItem('widely::logoPath')) {
        $scope.logo = localStorage.getItem('widely::logoPath');
    } else {
        $scope.logo = "assets/img/logo.png";
    }
    
    $scope.reset = function () {
        var ref = getFirebaseRef.ref;
        $scope.load = true;
        var callback = function (error) {
            $scope.$apply(function () {
                if (error) {
                    $scope.resultClass = "phd-callout callout-danger";
                    $scope.load = false;
                    switch (error.code) {
                        case "INVALID_PASSWORD":
                            $scope.msg = getMessage.GetData('reset_pass_inv_pass');
                            break;
                        case "INVALID_USER":
                            $scope.msg =getMessage.GetData('reset_pass_inv_user');
                            break;
                        default:
                            $scope.msg =getMessage.GetData('reset_pass_err');
                            $scope.msg = "Error changing password:" + error;
                    }
                } else {
                    $scope.msg = getMessage.GetData('reset_pass_success');
                    // $scope.hide = true;
                    $scope.resultClass = " phd-callout callout-success";
                    $scope.load = false;
                    // $state.go("resetPassword");

                }
            })
        }

        ref.changePassword({
            email: $scope.user.email,
            oldPassword: $scope.user.oldpswd,
            newPassword: $scope.user.newpswd
        }, callback);
    };
}