"use strict"
var app = angular.module('phive');
app.controller('subscribersImpressions', ['$q', 'getLocalTime', 'timeStamp', '$http', '$scope', '$uibModal', '$firebaseObject', 'getFirebaseRef', 'getMessage', '$state', 'getState', 'filterDate', 'breadCrumb', '$location', 'formateDate', 'currentAuth', 'getEmailId', 'dateRange', 'getChart', 'getImprints', subscribersImpressions]);

function subscribersImpressions($q, getLocalTime, timeStamp, $http, $scope, $uibModal, $firebaseObject, getFirebaseRef, getMessage, $state, getState, filterDate, breadCrumb, $location, formateDate, currentAuth, getEmailId,
    dateRange, getChart, getImprints) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    $scope.subscriberObj = {};
    //  $scope.viewState= getState.GetData($state.current.name); 
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Impressions /';
    breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
    breadcrumbData.href_first = '#' + $location.$$url;
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);
    // any time auth status updates, add the user data to scope
    var controllerCode = function (ref, data) {
        var hashId = data.hashId;
        $scope._hashId = hashId;
        filterDate.setViewScope($scope);
        filterDate.show(true, 'col-xs-12 col-md-5 col-md-offset-1');
        // var dateObj = filterDate.get();
        $scope.fromDate = filterDate.initializeFromDate();
        $scope.toDate = filterDate.initializeToDate();

        $scope.getCampRecords = function (fromDate, toDate) {
            // 
            //get data from server
            //

            fromDate.setHours(0, 0, 0, 0);
            toDate.setHours(23, 59, 59, 0);

            if (fromDate && toDate) {
                fromDate = Date.parse(fromDate);
                toDate = Date.parse(toDate);
                $scope.load = true;

                // Get cached offlineViews
                var cachedOfflineRef = ref.child('users').child(hashId).child('searchResults');
                var obj = $firebaseObject(cachedOfflineRef);
                obj.$loaded()
                    .then(function (cachedData) {
                        if (cachedData) {

                            // check timestamp
                            if (cachedData.lastUpdated) {
                                timeStamp.diff(cachedData.lastUpdated, 'install', hashId).then(function (tsObj) {
                                    if (tsObj.isValid) {
                                        $scope.subscriberObj.overviewData = cachedData;
                                        $scope.bindChart($scope.subscriberObj.overviewData, fromDate, toDate, 'subscribersCount');
                                        $scope.load = false;
                                    } else {
                                        // get refresh data - stale data
                                        var impression2 = getImprints.getImprint(fromDate, toDate, hashId);
                                        impression2
                                            .then(function (offlineRes) {
                                                $scope.subscriberObj.overviewData = offlineRes.data.searchObj;
                                                $scope.bindChart($scope.subscriberObj.overviewData, fromDate, toDate, 'subscribersCount');
                                                $scope.load = false;
                                            })
                                            .catch(function (err) {
                                                console.log(err);
                                                $scope.load = false;
                                            })
                                    }
                                }).catch(function (b) {
                                    console.log(b);
                                });
                            } else {
                                // lastupdate is not present
                                var impression2 = getImprints.getImprint(fromDate, toDate, hashId);

                                impression2
                                    .then(function (offlineRes) {
                                        $scope.subscriberObj.overviewData = offlineRes.data.searchObj;
                                        $scope.bindChart($scope.subscriberObj.overviewData, fromDate, toDate, 'subscribersCount');
                                        $scope.load = false;
                                    })
                                    .catch(function (err) {
                                        console.log(err);
                                        $scope.load = false;
                                    })
                            }
                        } else {
                            // if cached data not present
                            var impression2 = $scope.getImprints(fromDate, toDate);
                            impression2
                                .then(function (offlineRes) {
                                    $scope.subscriberObj.overviewData = offlineRes.data.searchObj;
                                    $scope.bindChart($scope.subscriberObj.overviewData, fromDate, toDate, 'subscribersCount');
                                    $scope.load = false;
                                })
                                .catch(function (err) {
                                    console.log(err);
                                    $scope.load = false;
                                })
                        }
                    })
                    .catch(function (error) {
                        console.error("Error:", error);
                        $scope.load = false;
                        // display error 
                    });

            }
            else {
                // invalid fromDate & toDate
                console.log('fromDate ' + fromDate + ' toDate ' + toDate);
            }

        } // getCampRecords


        $scope.getCampRecords($scope.fromDate, $scope.toDate);

        $scope.bindChart = function (chartData, fromDate, toDate, imprintType) {
            $scope.filterObj = {};
            // $scope.filterObj.filters = [];
            var chartSubType, chartSubKeys, chartSubLen;

            // map filters -- start
            if(chartData.total){
            var chartKeys = Object.keys(chartData.total); 
            var chartLen = chartKeys.length;
            for (var i = 0; i < chartLen; i++) {
                if (typeof chartData.total[chartKeys[i]] === 'object') {
                    chartSubKeys = Object.keys(chartData.total[chartKeys[i]]);
                    chartSubLen = chartSubKeys.length;
                    for (var j = 0; j < chartSubLen; j++) {
                        $scope.filterObj[chartKeys[i]] = {};
                        $scope.filterObj[chartKeys[i]][chartSubKeys[j]] = 1;
                    }
                }
            }
        }
            // map filters -- end

            $scope.filterClick = function (innerType, outerType) {
                var tObj= {};
                tObj[outerType] = {};
                tObj[outerType][innerType] = 1;

                $scope.bindChart(chartData, fromDate, toDate, tObj);
                console.log('filter ' + innerType);
            }

            $scope.reset = function() {
                $scope.bindChart($scope.subscriberObj.overviewData, fromDate, toDate, 'subscribersCount');                
            }
            var chartMap = getChart.getChartData(chartData, fromDate, toDate, imprintType); // get chart data

            var labels = [];
            var data = [];
            labels = chartMap.labels;
            data = chartMap.data;

            console.log('chart data ' + chartData, labels, data);

            $scope.totalCount = chartMap.totalCount;
            $scope.labels = labels;
            $scope.series = ['offline count'];
            $scope.data = [
                data
            ];
            $scope.onClick = function (points, evt) {
                console.log(points, evt);
            };
            $scope.onmousemove = function (points, evt) {
                console.log(points, evt);
            };
            $scope.options = {
                pointHitDetectionRadius: 0.1,
                scales: {
                    yAxes: [
                        {
                            id: 'y-axis-1',
                            type: 'linear',
                            display: true,
                            position: 'left'
                        }
                    ]
                }
            };
        }
    };


    if (currentAuth === null) {
        $state.go('index');
    } else {
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);

        }
    }

}