var app = angular.module('phive');
app.controller('segmentsImpressions', ['$http', '$scope', 'config', '$firebaseAuth', '$uibModal', '$firebaseObject', 'getFirebaseRef', 'getMessage', '$state', 'getState', 'filterDate', 'breadCrumb', '$location', 'timeStamp', 'getLocalTime', 'currentAuth', 'getEmailId', segmentsImpressions]);

function segmentsImpressions($http, $scope, config, $firebaseAuth, $uibModal, $firebaseObject, getFirebaseRef, getMessage, $state, getState, filterDate, breadCrumb, $location, timeStamp, getLocalTime, currentAuth, getEmailId) {
    window.sessionStorage.setItem('currentPage', $location.path());
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Impressions /';
    breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
    breadcrumbData.href_first = '#' + $location.$$url;
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);
    // Setting default colors to chart, TODO: move this to any global config
    Chart.defaults.global.colours = ["#777777", "#02ceff", "#fd586f", "#A70219", "#d9534f", "#24282f", "#0219A7"];
    var controllerCode = function (ref, data) {
        filterDate.show(false);
        var hashId = data.hashId;
        $scope._hashId = hashId;
        $scope.load = false;
        var totalSegment = {};
        var segmentType = [];
        var segmentSubType = {};
        var chartData = {};
        $scope.segmentsObj = {};


        $scope.removeResult = function () {
            ref.child('user').child(hashId).child('searchResults').child('total');
            ref.remove(function (err) {
                if (err) {
                    console.log('not able to remove the searchResult ');
                } else {
                    console.log('success removing the searchResult');
                }
            })
        };
        $scope.getCampRecords = function (fromDate, toDate) {
            //
            //get data from server
            //

            $scope.load = true;
            // get segments  
            var segmentsRef = ref.child('users').child(hashId).child('segments');
            var obj = $firebaseObject(segmentsRef);
            obj.$loaded()
                .then(function (data) {
                    if (data) {
                        var segmentKeys = Object.keys(data);
                        //
                        // strip keys if start with $
                        // 
                        for (var i = 0; i < segmentKeys.length; i++) {
                            if (segmentKeys[i].startsWith('$')) {
                                segmentKeys.splice(i, 1);
                                i = i - 1;
                            }
                        }
                        $scope.totalCount = segmentKeys.length;
                        //
                        //create obj
                        //
                        if (segmentKeys.length > 1) {
                            for (var i = 0; i < segmentKeys.length; i++) {
                                // strip All users segment
                                if (!(data[segmentKeys[i]].segmentName === 'All Users') && !(data[segmentKeys[i]].segmentName === 'All')) {
                                    totalSegment[segmentKeys[i]] = data[segmentKeys[i]];
                                }
                            }
                            for (keys in totalSegment) {
                                if (!segmentType.length) {
                                    segmentSubType[totalSegment[keys].type] = [];
                                    segmentType.push(totalSegment[keys].type);
                                } else {
                                    if (segmentType.indexOf(totalSegment[keys].type) === -1) {
                                        segmentSubType[totalSegment[keys].type] = [];
                                        segmentType.push(totalSegment[keys].type);
                                    }
                                }

                            }

                            for (keys in totalSegment) {
                                if (!segmentSubType[totalSegment[keys].type].length) {
                                    segmentSubType[totalSegment[keys].type].push(totalSegment[keys].subType);
                                }
                                else {
                                    if (segmentSubType[totalSegment[keys].type].indexOf(totalSegment[keys].subType) === -1) {
                                        segmentSubType[totalSegment[keys].type].push(totalSegment[keys].subType);
                                    }
                                }
                            }
                            //
                            //initalize the segment type and selected segment
                            //
                            $scope.segmentType = segmentType;
                            $scope.selectedType = segmentType[0];
                            $scope.segmentsObj.AllSegments = segmentKeys.length;
                            // get search results

                            // Get cached segments
                            var cachedSegRef = ref.child('users').child(hashId).child('userInsights').child('segments');
                            var obj = $firebaseObject(cachedSegRef);
                            obj.$loaded()
                                .then(function (cachedData) {
                                    if (cachedData) {
                                        var cachedSegmentKeys = Object.keys(cachedData);
                                        // strip $ & lastUpdated
                                        for (var i = 0; i < cachedSegmentKeys.length; i++) {
                                            if (cachedSegmentKeys[i].startsWith('$')) {
                                                cachedSegmentKeys.splice(i, 1);
                                                i = i - 1;
                                            }
                                        }
                                    }
                                    // map to installObj
                                    $scope.segmentsObj.Segments = cachedSegmentKeys;

                                    // check cached segmemnts
                                    if ($scope.segmentsObj.Segments.length > 0) {

                                        // check timestamp
                                        timeStamp.diff(cachedData.lastUpdated, 'install', hashId).then(function (diffRes) {
                                            console.log(diffRes);
                                            if (typeof (diffRes) === 'object') {
                                                if (diffRes.isValid) {
                                                    // $scope.getSegmentImpressions();
                                                    chartData = cachedData;
                                                    $scope.bindChart()
                                                }
                                                else {
                                                    if (typeof (diffRes.currentTS) === 'number') {
                                                        $scope.getSegmentImpressions(diffRes.currentTS);
                                                    }
                                                }

                                            }
                                        }).catch(function (err) {
                                            console.log(err);
                                        });


                                    } else {
                                        // call getSegmentImpressions
                                        getLocalTime.get(hashId).then(function (clientTime) {
                                            if (typeof (clientTime) === 'number') {
                                                $scope.getSegmentImpressions(clientTime);
                                            }
                                        }).catch(function (err) {
                                            //
                                            //error getting timestamp
                                            //
                                        });

                                    }
                                    $scope.load = false;
                                })
                                .catch(function (error) {
                                    console.error("Error:", error);
                                    $scope.load = false;
                                    // display error 
                                });
                        } else {
                            //
                            //show err you have not created any segment
                            //
                            $scope.phd_errorMsg = getMessage.GetData('impressions_no_segment');
                            $scope.phd_error = true;
                            console.log('you have not created any segment');
                            $scope.load = false;
                        }
                    } else {
                        //
                        //show err no segment found
                        //
                        $scope.phd_errorMsg = getMessage.GetData('impressions_no_segment');
                        $scope.phd_error = true;
                        console.log('you have not created any segment');
                        $scope.load = false;
                        $scope.load = false;
                    }
                })
                .catch(function (error) {
                    console.error("Error:", error);
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    $scope.load = false;
                    // display error 
                });



        } // end - getCampRecords
        $scope.getCampRecords();

        $scope.getSegmentImpressions = function (currentTS) {
            var paramsData = {
                hashId: hashId,
                currentTS: currentTS,
                segmentType: segmentType,
                segmentSubType: segmentSubType
            }
            $http.post('/getSegmentImpressions', paramsData).then(function (getSegmentData) {
                if (typeof (getSegmentData) === 'object') {
                    var cachedSegments = getSegmentData.data;
                    console.log('cached segments ' + cachedSegments);
                    //
                    //check value
                    //
                    if (typeof (cachedSegments) === 'object' && Array.isArray(Object.keys(cachedSegments)) && Object.keys(cachedSegments).length) {
                        chartData = cachedSegments;
                    } else {
                        //
                        //err worng data 
                        //
                        $scope.phd_errorMsg = getMessage.GetData('error');
                        $scope.phd_error = true;
                        $scope.load = false;
                    }

                    $scope.bindChart()
                } else {
                    //
                    //err getting data from the getSegmentImpressions
                    //

                }
            }, function (err) {
                console.log(err);
                //
                //err getting data from the getSegmentImpressions
                //
            })
        }
        $scope.bindChart = function () {
            $scope.load = true;
            
            $scope.value = [];
            if (chartData && typeof (chartData) === 'object' && $scope.selectedType &&
                typeof ($scope.selectedType) === 'string' && $scope.selectedType.length &&
                typeof (chartData[$scope.selectedType]) === 'object') {
                
                $scope.labels = Object.keys(chartData[$scope.selectedType]);

                for (var i = 0; i < $scope.labels.length; i++) {
                    $scope.value.push(chartData[$scope.selectedType][$scope.labels[i]]);
                }

                // to remove true as label from install
                if($scope.selectedType == 'install') {
                    $scope.labels = [''];   
                }
                console.log($scope.value);
                $scope.load = false;

            } else {
                console.log('wrong data to bind');
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                $scope.load = false;
            }
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