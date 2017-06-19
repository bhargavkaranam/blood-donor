'use strict';

var app = angular.module('phive');
app.controller('loginController', ['$scope', '$firebaseAuth', 'currentAuth', '$state', 'config', 'getFirebaseRef', '$http', '$location', 'getMessage', 'getEmailId', 'socialLogins', 'logoPath', loginController]);

function loginController($scope, $firebaseAuth, currentAuth, $state, config, getFirebaseRef, $http, $location, getMessage, getEmailId, socialLogins, logoPath) {
    var ref = getFirebaseRef.ref;
    var fbAuth = getFirebaseRef.auth;
    $scope.msg = "";
    $scope.result = false;
    $scope.remember = true;
    // any time auth status updates, add the user data to scope

    var authData = currentAuth;
    if (authData != null) {
        //if (authData.provider == 'password') {
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

    // if(currentAuth !== null){

    //$state.go('dashboard');
    //  }

    if ($location.search().hashId) {

        $scope.showMsg = false;
        $scope.load = true;
        $scope.msg = {
            success: '',
            failure: ''
        }
        var hashId = $location.search().hashId;
        var email = $location.search().email;
        $http.get('/validateHashId', {
            params: {
                hashId: hashId,
            }
        }).then(function (res) {
            if (res.data) {

                var dataSend = {
                    hashId: hashId,
                    email: email
                }
                $http.get('/activateUser', {
                    params: dataSend
                }).then(function (response) {
                    $scope.load = false;
                    $scope.msg.success = true;
                    $scope.showMsg = true;
                    if (response.data) {
                        $scope.infoSuccess = getMessage.GetData('user_already_activated');
                    } else {
                        $scope.infoSuccess = getMessage.GetData('user_activation_success');
                    }
                }, function (err) {
                    console.log('not activated ' + err);
                    $scope.load = false;
                    $scope.msg.failure = true;
                    $scope.showMsg = true;
                    $scope.activationFailure = getMessage.GetData('user_activation_failure');
                });

            }
        }, function (err) {
            $scope.load = false;
            $scope.msg.failure = true;
            $scope.showMsg = true;
            $scope.activationFailure = getMessage.GetData('user_activation_failure');
        })
    }

    if ($location.search().org) {
        var org = $location.search().org;
        // later create the service
        $scope.logo = logoPath.getLogo(org).logo;
        $scope.sellerLogin = true;
        var titleText = document.getElementsByTagName("title");
        var org_title = org+"_title";
        titleText[0].innerHTML = getMessage.GetData(org_title);

        var loginText = document.getElementById("loginText");
        loginText.innerHTML = getMessage.GetData(org);
 
    } else if (localStorage.getItem('widely::logoPath')) {
        $scope.logo = localStorage.getItem('widely::logoPath');
    } else {
        $scope.logo = "assets/img/logo.png";
    }
    $scope.login = function () {
        $scope.showMsg = false;
        $scope.result = false;

        var email = $scope.user.email;
        var pswd = $scope.user.pswd;
        var authObj = $firebaseAuth(fbAuth);
        $scope.load = true;

        if (typeof (email) !== "undefined" && typeof (pswd) !== "undefined") {
            if ($scope.remember) {
                var remember = 'default';
            } else {
                var remember = 'sessionOnly';
            }
            authObj.$signInWithEmailAndPassword(email, pswd).then(function (authData) {
                    console.log("Logged in as:", authData.uid);
                    $state.go('dashboard');
                    $scope.load = false;

                }).catch(function (error) {
                    $scope.load = false;
                    document.getElementById('email').focus();
                    $scope.msg = getMessage.GetData('loginFailed');
                    $scope.result = true;
                    console.error("Authentication failed:", error);
                });

        }
        else if (email == undefined || email == "" || pswd == undefined || pswd == "") {
            $scope.load = false;
            $scope.msg = getMessage.GetData('login_failure');
            $scope.result = true;
            $scope.show = true;
        }
    };
    $scope.loginWithGoggle = function () {
        socialLogins.loginWithGoogle($scope);
    };
    $scope.loginWithGitHub = function () {
        socialLogins.loginWithGitHub($scope);
    };
    $scope.forgetPassword = function () {
        $state.go('forgetPassword');
    };
};