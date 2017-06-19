var app = angular.module('phive');

app.controller('campaignDetail', ['$scope', 'productId', 'updateTemplate', '$firebaseObject',
    '$uibModal', '$state', 'Auth', '$firebaseArray', '$location', 'getFirebaseRef',
    'getMessage', 'getState', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId',
    function ($scope, productId, updateTemplate, $firebaseObject, $uibModal, $state, Auth,
        $firebaseArray, $location, getFirebaseRef, getMessage, getState, filterDate, breadCrumb, currentAuth, getEmailId) {

        window.sessionStorage.setItem('currentPage', $location.path());
        $scope.auth = Auth;
        $scope.load = true;
        $scope.bigCurrentPage = 1;
        $scope.showdp = false;
        $scope.dtmax = new Date();
        $scope.dateformat = 'MM/dd/yyyy';
        $scope.showDpResult = false;
        $scope.result = false;

        var breadcrumbData = {};
        breadcrumbData.breadCrumbHead = 'Actions /';
        breadcrumbData.bCrumblink_first = 'Campaigns';
        breadcrumbData.href_first = '#/dashboard/campaigns';
        breadcrumbData.bCrumbForSecElement = getState.GetData($state.current.name);
        breadcrumbData.hrefForSecElement = '#' + $location.$$url;
        breadCrumb.setbreadCrumbData(breadcrumbData);

        $scope.pageResult = false;
        // any time auth status updates, add the user data to scope
        var controllerCode = function (ref, data) {
            var hashId = data.hashId;
            filterDate.show(false);
            var getId = $location.$$search.campId;
            console.log("id " + getId);
            if (typeof (getId) !== 'undefined') {

                $scope.selTemplate = $firebaseObject(ref.child('users').child(hashId).child('templates').child(getId));
                // $scope.load = false;
                // in case of edit campaign
                $scope.editTemplate = function (obj) {
                    //  console.log("id to edit "+ obj); 
                    updateTemplate.setTemplate(obj);  // pass the obj     
                    $scope.animationsEnabled = true;
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'views/modals/client.campaign.modal.html',
                        controller: 'campaignModal',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            "currentAuth": ["Auth", function (Auth) {
                                return Auth.$waitForSignIn();
                            }]
                        }
                    });
                }

                // send the campaign to push message
                $scope.sendMessage = function (obj) {
                    productId.setProductId(obj);
                    $state.go('dashboard.sendPushNotification');
                }
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
                    console.log('Page changed to: ' + $scope.pagination.bigCurrentPage);
                };
                $scope.getCampRecords = function (fromDate, toDate) {
                    $scope.load = true;
                    filterDate.setLocalStorage(fromDate, toDate);
                    fromDate.setHours(0, 0, 0, 0);
                    toDate.setHours(23, 59, 59, 0);
                    $scope.pageResult = false;
                    var fromDate = Date.parse(fromDate);
                    var toDate = Date.parse(toDate);
                    if (fromDate < toDate) {
                        var sortedArr = $firebaseArray(ref.child('users').child(hashId).child('posts'));
                        sortedArr.$ref()
                            .orderByChild('timeStamp')
                            .startAt(fromDate)
                            .endAt(toDate)
                            .once('value', function (dataSnap) {
                                var stats = dataSnap.val();
                                var campaignStats = []
                                if (stats) {
                                    var keys = Object.keys(stats);
                                    for (var key in keys) {
                                        if (stats[keys[key]].campaignId == getId) {
                                            campaignStats.push(stats[keys[key]]);
                                        }
                                    }
                                    if (campaignStats.length !== 0) {
                                        $scope.load = false; // disable loader
                                        $scope.result = false;
                                        $scope.showDpResult = true; // show results

                                        $scope.stats = campaignStats;
                                        $scope.postCount = campaignStats.length;
                                    }
                                    else {
                                        // no search result found
                                        $scope.load = false; // disable loader
                                        $scope.showDpResult = true; // show results
                                        $scope.pageResult = true;
                                        $scope.msg = getMessage.GetData('pagination_no_result');
                                        console.log($scope.msg);
                                    }

                                    $scope.pagination = {
                                        bigCurrentPage: 1,
                                        maxSize: 5,
                                        bigTotalItems: campaignStats.length,
                                        itemsPerPage: $scope.selTemplate.viewPostsLimit
                                    };
                                } else {
                                    // no search result found
                                    $scope.load = false; // disable loader
                                    $scope.result = false;
                                    $scope.showDpResult = true; // show results

                                    $scope.pageResult = true;
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
                    else {
                        $scope.load = false; // disable loader
                        $scope.showDpResult = false; // show results
                        $scope.result = true;
                        $scope.msg = getMessage.GetData('date_err');
                        console.log($scope.msg);
                    }
                }
                $scope.getCampRecords($scope.fromDate, $scope.toDate);
            }
            else {
                $scope.load = false;
                $scope.result = true;
                $scope.msg = getMessage.GetData('camp_details_no_camp_selected_err');
                $state.go('dashboard.campaigns');
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

    }])

