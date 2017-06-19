'use strict';

var app = angular.module('phive');
app.controller('registerController', ['$scope', '$uibModal', '$http', 'getMessage', 'getEmailId', 'socialLogins', 'currentAuth', '$state', registerController]);

function registerController($scope, $uibModal, $http, getMessage, getEmailId, socialLogins, currentAuth, $state) {

    // if (currentAuth != null) {
    //     //$state.go('dashboard');
    // }
    var authData = currentAuth;
    //  $scope.auth.$onAuth(function (authData) {
    if (authData != null) {
        //  if (authData.provider === 'password') {
        $state.go('dashboard');
        // }
        // else{
        //         $scope.load = true;
        //         console.log("Authenticated successfully with payload:", authData);
        //         var uid = authData.uid;
        //         var social;
        //         var email = authData[authData.provider].email;
        //         var name = authData[authData.provider].displayName || authData[authData.provider].username || 'unknown';

        //         getEmailId.socialLogin($scope, uid, email, name);
        // }
    }
    //});
    $scope.msg = {
        success: '',
        failure: '',
    };

    // logo

    $scope.logo = "assets/img/logo.png";

    $scope.result = false;
    $scope.load = false;
    $scope.notRecaptcha = false;
    $scope.term = true;
    $scope.passwordErrMsg = getMessage.GetData('register_invalid_password');
    $scope.recaptchaCallback = function () {
        //     console.log(response);           
        $scope.notRecaptcha = false;
    }

    var email, pswd, name, company, term, inviteCode, password;

    $scope.register = function () {
        $scope.result = false;
        email = $scope.user.email;
        pswd = $scope.user.pswd;
        name = $scope.user.name;
        company = $scope.user.company;
        inviteCode = $scope.user.inviteCode;
        password = $scope.user.pswd;
        term = $scope.term;
        $scope.load = true;
        if (inviteCode && inviteCode.length <= 15) {
            $scope.load = false;
            $scope.result = true;
            $scope.msg.failure = true;
            $scope.err = getMessage.GetData('register_invalid_code');
        }
        if (typeof (email) !== "undefined" && typeof (pswd) !== "undefined" && typeof (name) !== "undefined" && term) {
            if (/^(?=.*[^a-zA-Z])(?=.*[0-9])\S{6,15}$/.test(pswd)) {
                var getAdminData = {
                    // hashId: hashId,
                    email: email
                }
                $http.get('/getAdmin', { params: getAdminData }).then(function (success) {
                    if (success.data.status) {
                        console.log('you are already invited ');
                        var invitedUserRole = success.data.role;
                        var invitedUserhasId = success.data.hashId;
                        var invitedCompany = success.data.company;

                        //
                        //pop up to conform
                        //
                        $scope.animationsEnabled = true;
                        $scope.conf = false;
                        $scope.load = false;
                        var modalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            templateUrl: 'views/modals/client.invited.modal.html',
                            controller: 'invitedModal',
                            resolve: {
                                data: function () {
                                    return {
                                        role: invitedUserRole,
                                        company: invitedCompany
                                    }
                                },

                            }
                        });
                        modalInstance.result.then(function (data) {
                            $scope.conf = data;
                            if ($scope.conf) {
                                //
                                //invitation accepted
                                //
                                var Details = {
                                    email: email,
                                    hashId: invitedUserhasId,
                                    role: invitedUserRole,
                                    invitation: 'accepted'
                                }
                                $scope.load = true;
                                //
                                //set the invitation node to accepted
                                //
                                $http.get('/setAdmin', { params: Details }).then(function (mailResult) {
                                    $scope.load = true;
                                    //
                                    //register user as invited user
                                    //
                                    $scope.invitedUser(invitedUserhasId, invitedUserRole, password);
                                }, function (err) {
                                    console.log(err);
                                })
                            }
                            else { 
                                if (!$scope.conf) {
                                    //
                                    //invitation rejected
                                    //
                                    var Details = {
                                        email: email,
                                        hashId: invitedUserhasId,
                                        role: invitedUserRole,
                                        invitation: 'rejected',
                                    }
                                    $scope.load = true;
                                    //
                                    //set the invitation node to rejected
                                    //
                                    $http.get('/setAdmin', { params: Details }).then(function (mailResult) {
                                        $scope.load = true;
                                        //
                                        //register user as regular user
                                        //
                                        $scope.notInvitedUser();
                                    }, function (err) {
                                        console.log(err);
                                    })
                                }
                            }
                        })
                    }
                    else {
                        if (!success.data) {
                            $scope.load = true;
                            $scope.notInvitedUser();
                        }
                    }
                }, function (err) {
                    console.log('err during getting data firebase');
                });

            } else {
                $scope.load = false;
                $scope.result = true;
                $scope.msg.failure = true;
                $scope.err = getMessage.GetData('register_invalid_password');
            }

        }// closing if block
        else {
            $scope.load = false;
            $scope.result = true;
            $scope.msg.failure = true;
            $scope.err = getMessage.GetData('register_failure');
        }

    }

    $scope.notInvitedUser = function () {
        var data =
            JSON.stringify({
                email: email,
                name: name,
                company: company,
                term: term,
                invitedUser: false,
                inviteCode: inviteCode,
                password: password
            })

        $http.post("/createNode", data)
            .then(function (res) {
                $scope.load = false;
                $scope.result = true;
                $scope.msg.success = true;
                $scope.infoSuccess = getMessage.GetData('register_success');
                $scope.user = null;

            }, function (err) {
                console.log('err during createNode:- status :: ' + err.status + ',err.data :: ' + err.data);
                if (err.data && Object.keys(err.data).length) {
                    var message = getMessage.GetData('register_' + err.data);
                    if (message && typeof message === 'string' && message.length) {
                        $scope.load = false;
                        $scope.result = true;
                        $scope.msg.failure = true;
                        $scope.err = getMessage.GetData('register_' + err.data);
                    } else {
                        $scope.load = false;
                        $scope.result = true;
                        $scope.msg.failure = true;
                        $scope.err = getMessage.GetData('register_failure');
                    }
                } else {
                    $scope.load = false;
                    $scope.result = true;
                    $scope.msg.failure = true;
                    $scope.err = getMessage.GetData('register_failure');
                }

            })
    }
    $scope.invitedUser = function (invitedUserhasId, invitedUserRole, password) {
        var mapClientData = JSON.stringify({
            email: email,
            hashId: invitedUserhasId,
            role: invitedUserRole,
            name: name,
            term: term,
            invitedUser: true,
            password: password
        })
        $http.post('/createNode', mapClientData).then(function (success) {
            if (success.data) {
                $scope.load = false;
                $scope.result = true;
                $scope.msg.success = true;
                $scope.infoSuccess = getMessage.GetData('register_success_invitedUser');
            }
            else {
                if (!success.data) {
                    $scope.load = false;
                    $scope.result = true;
                    $scope.msg.failure = true;
                    $scope.err = getMessage.GetData('register_failure');
                }
            }
        }, function (err) {
            $scope.load = false;
            //show message;
            $scope.msg.failure = true;
            $scope.result = true;
            $scope.err = getMessage.GetData('register_failure');
        })
    }
    $scope.loginWithGoggle = function () {
        socialLogins.loginWithGoogle($scope);
    };
    $scope.loginWithGitHub = function () {
        socialLogins.loginWithGitHub($scope);
    };


}
app.filter("sanitize", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);   