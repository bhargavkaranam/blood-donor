"use strict";
var app = angular.module('phive');
app.controller('welcomeController', ['$scope',
    '$state', '$firebaseObject', 'getFirebaseRef', 'getMessage', 'getState',
    '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', welcomeController]);

function welcomeController($scope,
    $state, $firebaseObject, getFirebaseRef, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    $scope.isHide = true;
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Actions /';
    breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
    breadcrumbData.href_first = '#' + $location.$$url;
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    var uid;
    // any time auth status updates, add the user data to scope
    var checkAuth = currentAuth;

    var controllerCode = function (ref, data) {
        var hashId = data.hashId;
        filterDate.show(false);
        var uid = checkAuth.uid;

        $scope.msg = {};


        // display data
        var updatedRef = ref.child('users').child(hashId).child('posts').child('welcomeMessage');
        var obj = $firebaseObject(updatedRef);
        obj.$loaded(
            function (initObj) {
                $scope.load = false;
                $scope.welcome = {};
                if (initObj.title == undefined) {
                    var conf = $firebaseObject(ref.child('users').child(hashId).child('config'));
                    conf.$loaded().then(function (data) {                      
                        $scope.welcome.defaultIconUrl = data.notificationUrl || "";
                        $scope.welcome.landingUrl = data.domain || "";
                        $scope.welcome.title = "Thanks for Subscribing";
                        $scope.welcome.message = "We will keep you posted with ausome stuff!";
                        $scope.welcome.flag = true;
                        $scope.save();
                    });
                }
                console.log("title " + initObj.title);
                $scope.welcome.title = initObj.title;
                $scope.welcome.message = initObj.message;
                $scope.welcome.defaultIconUrl = initObj.icon;
                $scope.welcome.landingUrl = initObj.url;
                $scope.welcome.flag = initObj.welcomeFlag;
                //  console.log(data === obj); // true
            },
            function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.error("Error:", error);
            }
        );

        $scope.save = function () {
            $scope.load = true;
            var updatedRef = ref.child('users').child(hashId).child('posts');
            // var obj = $firebaseObject(updatedRef);
            // var obj = {};

            var icon = $scope.welcome.defaultIconUrl;
            var url = $scope.welcome.landingUrl;

            if (typeof (url) === 'undefined' || typeof (url) === 'undefined') {
                url = "";
            }
            if (typeof (icon) === 'undefined' || icon == null) {
                icon = "";
            }
            if (typeof ($scope.welcome.flag) === 'undefined') {
                $scope.welcome.flag = false;
            }
            var obj = {
                title: $scope.welcome.title,
                message: $scope.welcome.message,
                icon: icon,
                url: url,
                welcomeFlag: $scope.welcome.flag
            }
            var onComplete = function (error) {
                $scope.$apply(function () {


                    $scope.load = false;
                    // $scope.result = true;
                    if (error) {
                        $scope.msg.err = true;
                        $scope.errMsg = getMessage.GetData('welcome_msg_err');
                        $scope.isHide = false;
                        console.log("Error:", error);
                    }
                    else {
                        if ($scope.welcome.flag == false) {
                            $scope.msg.savedNotToSub = true;
                            $scope.savedNotToSubbMsg = getMessage.GetData('welcome_msg_saved_not_sent_to_sub');
                            $scope.isHide = false;
                        } else {
                            $scope.msg.savedSendToSub = true;
                            $scope.savedSendTosubMsg = getMessage.GetData('welcome_msg_saved_sent_to_sub');
                            $scope.isHide = false;
                        }
                    }
                })
            }

            updatedRef.child('welcomeMessage').update(obj, onComplete);
        }
    };
    if (checkAuth === null) {
        console.log('check ' + checkAuth);
        $state.go('index');
    } else {
        console.log('Auth ' + checkAuth);
        uid = checkAuth.uid;
        // $scope.result = false;
        var ref = getFirebaseRef.ref;
        var email = getEmailId.getEmail(currentAuth);;
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}