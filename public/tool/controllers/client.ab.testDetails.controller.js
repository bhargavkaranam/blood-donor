'use strict';
var app = angular.module('phive')


app.controller('abTestDetailsController', ['$scope', '$firebaseObject',
    '$firebaseArray', 'getFirebaseRef', '$location', 'getState', '$state', 'getMessage'
    , 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', abTestDetailsController]);

function abTestDetailsController($scope, $firebaseObject, $firebaseArray, getFirebaseRef, $location, getState, $state, getMessage, filterDate, breadCrumb, currentAuth, getEmailId) {
    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Actions /';
    breadcrumbData.bCrumblink_first = 'A-B Split Testing';
    breadcrumbData.href_first = '#/dashboard/ab-split-testing';
    breadcrumbData.bCrumbForSecElement = getState.GetData($state.current.name);
    breadcrumbData.hrefForSecElement = '#' + $location.$$url;
    breadCrumb.setbreadCrumbData(breadcrumbData);
       
    var controllerCode = function (ref,data) {
        var hashId=data.hashId;
        var testId = $location.search().testId;
        filterDate.show(false);
        if (testId && typeof (testId) === 'string' && testId.length) {
            var getPostId = $firebaseArray(ref.child('users').child(hashId).child('posts').orderByChild('testId').equalTo(testId));
            getPostId.$loaded().then(function (data) {
                $scope.tests = data;
                $scope.colorsRest = ["#02ceff", "#eeeeee"];
                $scope.labelsA = ["Conversion Rate", ""];
                $scope.labelsB = ["Conversion Rate", ""];
                for (var i = 0; i < data.length; i++) {
                    if (data[i].testType === 'testA') {
                        var conversionRateA = Math.round(data[i].conversionRate * 100) / 100;
                        $scope.dataA = [conversionRateA, Math.round(100 - conversionRateA)];
                    }
                    if (data[i].testType === 'testB') {
                        var conversionRateB = Math.round(data[i].conversionRate * 100) / 100;
                        $scope.dataB = [conversionRateB, Math.round(100 - conversionRateB)];
                    }

                }
                $scope.load = false;
            }, function (err) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.log('err getting data from the firebase:-' + err);
            });
            var getTestData = $firebaseObject(ref.child('users').child(hashId).child('AbTesting').child(testId).child('details'));
            getTestData.$loaded().then(function (testData) {
                $scope.testData = testData;
            }, function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.log(error);
            })
        } else {
            $scope.load = false;
            $scope.phd_errorMsg = getMessage.GetData('error');
            $scope.phd_error = true;
            console.log('no testId found');
        }
    };
    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
       var email =  getEmailId.getEmail(currentAuth);
        if(email){
         getEmailId.checkClientStatus(email, controllerCode, $scope);
    }
    }
   

}