/**
 * Master Controller
 */


angular.module('phive')
    .controller('dashboardController', ['$scope', '$uibModal', '$state', 'config', '$http', '$firebaseObject', 'getFirebaseRef', 'getMessage', 'getState', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', '$rootScope', dashboardController]);

function dashboardController($scope, $uibModal, $state, config, $http, $firebaseObject, getFirebaseRef, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId, $rootScope) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    $scope.isOpen = false;
    var auth = currentAuth;
    // $scope.viewState= getState.GetData($state.current.name);  // get state 
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = "";
    breadcrumbData.href_first = "";
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    var controllerCode = function (ref, data) {
        var hashId = data.hashId;
        filterDate.show(false);
        var updatedObj = ref.child('users').child(hashId).child('userInsights');
        $scope.userInsights = {
            installedCount: 0,
            totalDU: 0,
            campaignCount: 0,
            subscribersCount: 0,
            appViews: 0,
            offlineViews: 0
        };

        $scope.userInsightsNew = {};

        updatedObj.on('value',
            function (dataSnap) {
                var data = dataSnap.val();

                //installed count   
                if (typeof (data) !== 'object' || typeof (data.user) !== 'object' || typeof (data.user.installCount) === 'undefined' || data.user.installCount === null) {
                    $scope.userInsights.installedCount = 0;
                } else {
                    $scope.userInsights.installedCount = data.user.installCount;
                }

                // user count
                if (typeof (data) !== 'object' || typeof (data.user) !== 'object' || typeof (data.user.totalDU) === 'undefined') {
                    $scope.userInsights.totalDU = 0;
                } else {
                    $scope.userInsights.totalDU = data.user.totalDU;
                }

                // campaigns count 
                if (typeof (data) !== 'object' || typeof (data.campaigns) !== 'object' || typeof (data.campaigns.totalCampaigns) === 'undefined') {
                    $scope.userInsights.campaignCount = 0;
                } else {
                    $scope.userInsights.campaignCount = data.campaigns.totalCampaigns;
                }

                // subscriber count
                if (typeof (data) !== 'object' || typeof (data.user) !== 'object' || typeof (data.user.subscribersCount) === 'undefined') {
                    $scope.userInsights.subscribersCount = 0;
                } else {
                    $scope.userInsights.subscribersCount = data.user.subscribersCount;
                }
                // App Views
                if (typeof (data) !== 'object' || typeof (data.user) !== 'object' || typeof (data.user.appViews) === 'undefined') {
                    $scope.userInsights.appViews = 0;
                } else {
                    $scope.userInsights.appViews = data.user.appViews;
                }
                // Offline Views
                if (typeof (data) !== 'object' || typeof (data.user) !== 'object' || typeof (data.user.offlineViews) === 'undefined') {
                    $scope.userInsights.offlineViews = 0;
                } else {
                    $scope.userInsights.offlineViews = data.user.offlineViews;
                }

                $scope.load = false;
            },
            function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.error("Error:", error);
            }
        ); // end of stats

        // check configuration 

        var configObj = $firebaseObject(ref.child('users').child(hashId).child('config'));
        configObj.$loaded()
            .then(function (data) {
                var api_key = data.api_key;
                if (typeof (data.api_key) === 'undefined' || !api_key.length) {
                   // console.log("Welcome to Widely , Kindly fill your settings to roll");
                    $scope.newUser = true;
                    $scope.showView = true;
                    // send mail     
                        $scope.animationsEnabled = true;
                        if (!window.sessionStorage.getItem('Progresshive::newUser') && !$scope.isOpen) {
                            $scope.isOpen = true;


                            var modalInstance = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'views/modals/tour/welcome.tour.html',
                                controller: 'welcomeTour',
                                size: 'sm',
                                backdrop: 'static',
                                resolve: {
                                    data: function () {
                                        return appSetting = data;
                                    },

                                }
                            });

                            modalInstance.result.then(function (appsetting) {
                                var appSettingData = angular.copy(appsetting || {});
                                // console.log(appSettingData);

                                var config = {
                                    API_KEY: "",
                                    project_no: "",
                                    notificationUrl: appSettingData.notificationUrl || "",
                                    hashId: hashId,
                                    timeZone: appSettingData.timeZone || '',
                                    domain: appSettingData.domain || "",
                                    manifest: {
                                        name: appSettingData.manifest.name || '',
                                        default_homeScreenUrl: '',
                                        sort_name: "",
                                        description: '',
                                        start_url: '',
                                        background_color: '',
                                        theme_color: '',
                                        display: '',
                                        orientation: ''
                                    }

                                }
                                var domain = appSettingData.domain || "";
                                var offset = parseFloat(appSettingData.timeZone) || 5.5;

                                var pwaMappings = $firebaseObject(ref.child('users').child(hashId).child('pwaMappings'));
                                pwaMappings.clientTimeZone = offset;
                                pwaMappings.domain = domain;
                                pwaMappings.$save().then(function (ref) {

                                }, function (error) {
                                    $scope.load = false;
                                    $scope.phd_errorMsg = getMessage.GetData('error');
                                    $scope.phd_error = true;
                                    console.log("Error:", error);
                                });

                                $http.post("/saveAppSettings", config).success(function (result, status) {

                                    if (result === "success") {
                                        window.sessionStorage.setItem('Progresshive::newUser', false);
                                    }
                                })

                            }, function (appsetting) {
                                console.log('first time appsetting aborted by user');
                                var appSettingData = angular.copy(appsetting || {});
                                console.log(typeof (appSettingData.manifest));
                                if (typeof (appSettingData.manifest) === 'undefined') {
                                    appSettingData.manifest = {};
                                }
                                // console.log(appSettingData);
                                var config = {
                                    API_KEY: "",
                                    project_no: "",
                                    notificationUrl: appSettingData.notificationUrl || "",
                                    hashId: hashId,
                                    timeZone: appSettingData.timeZone || '',
                                    domain: appSettingData.domain || "",
                                    manifest: {
                                        name: appSettingData.manifest.name || '',
                                        default_homeScreenUrl: '',
                                        sort_name: "",
                                        description: '',
                                        start_url: '',
                                        background_color: '',
                                        theme_color: '',
                                        display: '',
                                        orientation: ''
                                    }

                                }
                                $http.post("/saveAppSettings", config).success(function (result, status) {

                                    if (result === "success") {
                                        console.log('partial data saved to config');
                                    }
                                })

                            })

                            // }, function () {
                            //     console.log('tour aborted by user');
                            // })
                        }
                } else {
                    $scope.newUser = false;
                    $scope.showView = true;
                }
            })
            .catch(function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.error("Error:", error);
            });



        // $scope.shareAccessToDeveloper = function () {
        //     $scope.load = true;
        //     $scope.msg = {
        //         success: '',
        //         failure: '',
        //         showMsg: false
        //     }

        //     var email = $scope.dev.email;
        //     // var password = $scope.dev.password;
        //     if (email !== null || typeof (email) !== 'undefined') {

        //         // var data =
        //         //     JSON.stringify({
        //         //         email: email,
        //         //         password: password,
        //         //         hashId: hashId

        //         //     });

        //         var mailDetails = {
        //             email: email,
        //             // hashId: hashId,
        //             // password: password
        //         };

        //         // $http.post("/registerAppSettingUser", data).success(function (result, status) {

        //         // send mail     
        //         $http.get('/developerLoginMail', { params: mailDetails }).then(function (mailResult) {

        //             console.log(mailResult);
        //             $scope.load = false;
        //             $scope.shareWithDevSuccess = msgObj.share_with_develpoer_success;
        //             $scope.msg.success = true;
        //             $scope.msg.showMsg = true;

        //         }, function (errorMsg) {
        //             $scope.load = false;
        //             $scope.shareWithDevFailure = msgObj.share_with_develpoer_failure;
        //             $scope.msg.failure = true;
        //             $scope.msg.showMsg = true;
        //             console.log(errorMsg)
        //         });

        //         $scope.dev = "";
        //         console.log(" send to developer");
        //         // });


        //     }

        // }
    };

    // any time auth status updates, add the user data to scope
    // $scope.auth.$onAuth(function (authData) {
    //     $scope.authData = authData;
    if (!auth) {
        $state.go('index');
    } else {
        // get hash ID  
        $scope.showView = false;
        var email = getEmailId.getEmail(auth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

};