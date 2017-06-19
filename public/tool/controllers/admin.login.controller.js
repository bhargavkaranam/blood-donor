'use strict';

var app = angular.module('phive');
app.controller('admLoginController', ['$scope', '$firebaseAuth', '$state', 'getFirebaseRef', '$http', 'getMessage','getEmailId', admLoginController]);

function admLoginController($scope, $firebaseAuth, $state, getFirebaseRef, $http, getMessage,getEmailId) {
    $scope.msg = "";
    $scope.result = false;
    var ref = getFirebaseRef.ref;
    var fbAuth = getFirebaseRef.auth;
    // $scope.remember = true;

    // any time auth status updates, add the user data to scope
    $scope.login = function() {
        var email = $scope.user.email;
        var pswd = $scope.user.pswd;
        var authObj = $firebaseAuth(fbAuth);
        $scope.load = true;

        if (typeof (email) !== "undefined" && typeof (pswd) !== "undefined") {
            if ($scope.remember) {
                var remember = 'default';
            }
            else {
                var remember = 'sessionOnly';
            }
            authObj.$signInWithEmailAndPassword(email, pswd).then(function(authData) {
                var data = {
                    uid: authData.uid
                }
                $http.get('/validateAdm', { params: data }).then(function(success) {
                    if (success.data) {
                        $state.go('admDashboard');
                    }
                    else {
                        $state.go('index');
                    }
                }, function(err) {
                    console.log(err);
                })

            }).catch(function(error) {
                $scope.load = false;
                $scope.msg = getMessage.GetData('loginFailed');
                $scope.result = true;
                console.error("Authentication failed:", error);
            });

        }
    };
    $scope.loginWithGoggle = function() {
        getEmailId.loginWithGoggle($scope);
    };
    $scope.loginWithGitHub = function() {
        getEmailId.loginWithGitHub($scope);
    };

}