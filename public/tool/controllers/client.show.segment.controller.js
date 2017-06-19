var app = angular.module('phive');
app.controller('showSegmentsController', ['$scope',
    '$state', '$firebaseArray', 'getState', 'getMessage', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', showSegmentsController]);

function showSegmentsController($scope, $state,
    $firebaseArray, getState, getMessage, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.result = false;
    $scope.load = true;

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

    var controllerCode = function(ref, data) {
        var hashId=data.hashId;
        filterDate.show(false);
        // get user segments
        var segArray = $firebaseArray(ref.child('users').child(hashId).child('segments'));
        segArray.$loaded()
            .then(function(x) {
                $scope.load = false;
                if (x.length <= 0) {
                    $scope.result = true;
                    $scope.msg = "You have no Segments";
                } else {
                    $scope.result = false;
                    $scope.segments = x;
                    $scope.pagination = {
                        bigCurrentPage: 1,
                        maxSize: 5,
                        bigTotalItems: x.length,
                        itemsPerPage: 10
                    };
                }
            })
            .catch(function(error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.log("Error:", error);
            });
    };
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
  

}