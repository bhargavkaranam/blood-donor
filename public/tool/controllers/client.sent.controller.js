

angular.module('phive').controller('sentController', ['$scope', '$firebaseObject',
    '$firebaseArray', 'getFirebaseRef', 'getMessage', 'getState', '$state',
    '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', sentController]);

function sentController($scope, $firebaseObject,
    $firebaseArray, getFirebaseRef, getMessage, getState, $state, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    $scope.bigCurrentPage = 1;
    $scope.showdp = false;
    $scope.dtmax = new Date();
    $scope.dateformat = 'MM/dd/yyyy';
    $scope.showDpResult = false;

    $scope.result = false;
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
        var userInsights = $firebaseObject(ref.child('users').child(hashId).child('userInsights').child('posts'));
        userInsights.$loaded()
            .then(function (userInsightsData) {
                $scope.load = false;
                $scope.initializeDate = function () {
                    $scope.fromDate = filterDate.initializeFromDate();
                    $scope.toDate = filterDate.initializeToDate();
                };
                $scope.initializeDate();

                $scope.showFromcalendar = function ($event) {
                    $scope.showFromdp = true;
                };
                $scope.showTocalendar = function ($event) {
                    $scope.showTodp = true;
                };
                $scope.pageChanged = function () {
                    //   console.log('Page changed to: ' + $scope.pagination.bigCurrentPage + "  " + page);
                };
                $scope.getCampRecords = function (fromDate, toDate) {
                    $scope.result = false;
                    filterDate.setLocalStorage(fromDate, toDate);
                    fromDate.setHours(0, 0, 0, 0);
                    toDate.setHours(23, 59, 59, 0);
                    var fromDate = Date.parse(fromDate);
                    var toDate = Date.parse(toDate);
                    $scope.load = true;
                    var sortedArr = $firebaseArray(ref.child('users').child(hashId).child('posts'));
                    sortedArr.$ref()
                        .orderByChild('timeStamp')
                        .startAt(fromDate)
                        .endAt(toDate)
                        .once('value', function (dataSnap) {
                            var stats = dataSnap.val();
                            var campaignStats = []
                            if (stats) {
                                //  var keys = Object.keys(stats);
                                for (var key in stats) {
                                    if (stats.hasOwnProperty(key)) {
                                        campaignStats.push(stats[key]);
                                    }
                                }

                                $scope.load = false; // disable loader
                                $scope.showDpResult = true; // show results
                                $scope.stats = campaignStats;

                                $scope.pagination = {
                                    bigCurrentPage: 1,
                                    maxSize: 5,
                                    bigTotalItems: campaignStats.length,
                                    itemsPerPage: userInsightsData.viewPostsLimit
                                };
                                console.log('length ' + campaignStats.length);
                            } else {
                                // no search result found
                                $scope.load = false; // disable loader
                                $scope.showDpResult = true; // show results
                                $scope.result = true;
                                $scope.msg = getMessage.GetData('pagination_no_result');
                                console.log($scope.msg);
                            }

                        }, function (error) {
                            $scope.load = false;
                            $scope.phd_errorMsg = getMessage.GetData('error');
                            $scope.phd_error = true;
                            console.log(error);
                        });

                }
                $scope.getCampRecords($scope.fromDate, $scope.toDate);
            })
            .catch(function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.error("Error:", error);
            });

        $scope.pageChanged = function () {
            console.log('current page ' + $scope.pagination.bigCurrentPage);
            $scope.load = true;
            var key = ($scope.pagination.bigCurrentPage - 1) * $scope.pagination.itemsPerPage;
            var sortedArr = $firebaseArray(ref.child('users').child(hashId).child('posts'));
            sortedArr.$ref()
                .orderByKey()
                .limitToLast($scope.pagination.itemsPerPage)
                .startAt(key)
                .once('value', function (nextPage) {
                    var array = [];
                    var nextPageData = nextPage.val();

                    for (var item in nextPageData) {
                        // this condition is required to prevent moving forward to prototype chain
                        if (nextPageData.hasOwnProperty(item)) {
                            if (item != 'welcomeMessage') {
                                array.push(nextPageData[item]);
                            }
                        }
                    }
                    $scope.load = false;
                    $scope.stats = array;

                }, function (err) {
                    console.log(err);
                })

        }
    };
        // get hash ID  
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
 
}

