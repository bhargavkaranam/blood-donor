"use strict";

var app = angular.module('phive');
app.controller('impressionsOverview', ['$scope', 'config', '$firebaseAuth', '$uibModal', '$firebaseObject', 'getFirebaseRef', 'getMessage', '$state', 'getState', 'filterDate', 'breadCrumb', '$location', 'getLocalTime', 'timeStamp', '$q', 'formateDate', 'currentAuth', 'getEmailId', 'dateRange', 'getChart', 'getImprints', impressionsOverview]);

function impressionsOverview($scope, config, $firebaseAuth, $uibModal, $firebaseObject, getFirebaseRef, getMessage, $state, getState, filterDate, breadCrumb, $location, getLocalTime, timeStamp, $q, formateDate, currentAuth, getEmailId, dateRange, getChart, getImprints) {

    var totalRecords = false, graphRecords = false;
    $scope.overviewObj = {};
    window.sessionStorage.setItem('currentPage', $location.path());
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Impressions /';
    breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
    breadcrumbData.href_first = '#' + $location.$$url;
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);
    var controllerCode = function (ref, data) {
        console.log('inerereresdddddd');
        var fromDate, toDate;
        var hashId = data.hashId;
        $scope._hashId = hashId;
        $scope.load = false;
        filterDate.setViewScope($scope);
        filterDate.show(true, 'col-xs-12 col-md-5 col-md-offset-1');
        // var dateObj = filterDate.get();
        $scope.fromDate = filterDate.initializeFromDate();
        $scope.toDate = filterDate.initializeToDate();
        $scope.selectedTypeUsers = 'DUcount';
        $scope.tname = "Users";
        $scope.impressionsOverview = "fa fa-users";
        $scope.modernBrowsers = [
            { name: "Users", value: "DUcount", ticked: true, iconClass: "fa fa-users" },
            { name: "Installs", value: "installCount", ticked: false, iconClass: "fa fa-download" },
            { name: "App Views", value: "appViews", ticked: false, iconClass: "fa fa-mobile" },
            { name: "Site Views", value: "DUvisits", ticked: false, iconClass: "fa fa-desktop" },
            { name: "Offline Views", value: "offlineViews", ticked: false, iconClass: "fa fa-signal" }
        ];
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
                                        $scope.overviewObj.overviewData = cachedData;
                                        $scope.bindChart($scope.overviewObj.overviewData, fromDate, toDate, 'DUcount');
                                        $scope.load = false;
                                    } else {
                                        // get refresh data - stale data
                                        var impression2 = getImprints.getImprint(fromDate, toDate, hashId);
                                        impression2
                                            .then(function (offlineRes) {
                                                $scope.overviewObj.overviewData = offlineRes.data.searchObj;
                                                $scope.bindChart($scope.overviewObj.overviewData, fromDate, toDate, 'DUcount');
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
                                        $scope.overviewObj.overviewData = offlineRes.data.searchObj;
                                        $scope.bindChart($scope.overviewObj.overviewData, fromDate, toDate, 'DUcount');
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
                                    $scope.overviewObj.overviewData = offlineRes.data.searchObj;
                                    $scope.bindChart($scope.overviewObj.overviewData, fromDate, toDate, 'DUcount');
                                    console.log('offline obj ' + $scope.overviewObj);
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

        // var getClassForOverviewIcons = function (value){
        //      switch(value) {
        //             case "string":
        //             this.serializeString_((object), sb);
        //             break;
        //             case "number":
        //             this.serializeNumber_((object), sb);
        //             break;
        //             case "boolean":
        //             sb.push(object);
        //             break;
        //             default:
        //             throw Error("Unknown type: " + typeof object);;
        //         }
        //     return class;
        // }
        $scope.fClick = function (data) {
            console.log(data.name);
            $scope.tname = data.name;
            $scope.impressionsOverview = data.iconClass;
            $scope.bindChart($scope.overviewObj.overviewData, fromDate, toDate, data.value);
        }

        $scope.radioClick = function (rdata) {
            $scope.bindChart($scope.overviewObj.overviewData, fromDate, toDate, rdata);
        }

        $scope.bindChart = function (chartData, fromDate, toDate, imprintType) {

            var chartMap = getChart.getChartData(chartData, fromDate, toDate, imprintType); // get chart data

            var labels = [];
            var data = [];
           // $scope.chartColors = 
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
        var ref = getFirebaseRef.ref;
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}