var app = angular.module('phive');
app.controller('rssPushController', ['$scope', '$state',
    '$firebaseObject', 'config', '$http', 'getFirebaseRef', 'getMessage', 'getState', '$location',
    'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', '$templateCache', 'getToolTip', rssPushController]);

function rssPushController($scope, $state, $firebaseObject,
    config, $http, getFirebaseRef, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId, getToolTip) {

    $scope.filter = {};
    $scope.items = [];
    $scope.load = true;
    $scope.show = false;

    window.sessionStorage.setItem('currentPage', $location.path());
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = "";
    breadcrumbData.href_first = "";
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var email = getEmailId.getEmail(currentAuth);
        // get hash ID  
        var controllerCode = function (ref, data) {
            var hashId = data.hashId

            var rssObj = $firebaseObject(ref.child('users').child(hashId).child('rss'));
            rssObj.$loaded().then(function (x) {
            $scope.load = false;
                $scope.fUrl = x.feed_url;
            })
                .catch(function (err) {
                    console.log(err);
                })
            $scope.save = function () {

                rssObj.feed_url = $scope.fUrl;
                rssObj.$save().then(function (ref) {
                    console.log('saved')
                }, function (error) {
                    console.log("Error:", error);
                });
            }
        }
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}