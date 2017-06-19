var app = angular.module('phive')


app.controller('showAbTestController', ['$scope',
    '$firebaseArray', 'getFirebaseRef', 'getMessage',
    'getState', '$state', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', showAbTestController]);

function showAbTestController($scope,
    $firebaseArray, getFirebaseRef, getMessage, getState, $state, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    $scope.msg = {};
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Actions /';
    breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
    breadcrumbData.href_first = '#' + $location.$$url;
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
    var controllerCode = function (ref, data) {
        var hashId=data.hashId;
        filterDate.show(false);
        var getTestRef = $firebaseArray(ref.child('users').child(hashId).child('AbTesting'));
        getTestRef.$loaded().then(function (dataSnap) {
            if (!dataSnap.length) {
                $scope.noAB = getMessage.GetData('abTest_noData');
                $scope.msg.failure = true;
            }
            $scope.tests = dataSnap;
            $scope.pagination = {
                bigCurrentPage: 1,
                maxSize: 5,
                bigTotalItems: dataSnap.length,
                itemsPerPage: 10
            };
            $scope.load = false;
        }).catch(function (err) {
            $scope.load = false;
            $scope.phd_errorMsg = getMessage.GetData('error');
            $scope.phd_error = true;
            console.log(err);
        })
    };
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

   
}