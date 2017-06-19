var app = angular.module('phive');
app.controller('plugAndPlayController', ['$scope', '$state',
    '$firebaseObject', 'config', '$http', 'getFirebaseRef', 'getMessage', 'getState', '$location',
    'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', '$templateCache', 'getToolTip', '$uibModal', plugAndPlayController]);

function plugAndPlayController($scope, $state, $firebaseObject,
    config, $http, getFirebaseRef, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId, $templateCache, getToolTip, $uibModal) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.isCollapsed = true;
    $scope.downLoadBtn = false; // hide download btn when ever page load;
    $scope.load = true;
    $scope.copyCode = false;
    $scope.next = true;
    $scope.next1 = true;
    $scope.next2 = true;
    $scope.next3 = true;
    $scope.next4 = true;
    $scope.isOpen = false;
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = '';
    breadcrumbData.href_first = '';
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);
    // $scope.load = true;  TODO: resolve sw fetch issue first 
    var uid;
    $templateCache.put(
        'api.html',
        '<span>' + getToolTip.GetData('apiTip') + '</span><a  target="_blank" style="color:#02ceff;font-weight:bold" href="' + getToolTip.GetData('apiUrl') + '">' + getToolTip.GetData('apiUrlText') + '</a>'
    );
    $templateCache.put(
        'project.html',
        '<span>' + getToolTip.GetData('projectTip') + '<a target="_blank" style="color:#02ceff;font-weight:bold" href="' + getToolTip.GetData('projectUrl') + '">' + getToolTip.GetData('projectUrlText') + '</a>'
    );
    $scope.notificationTip = getToolTip.GetData('notificationTip');
    $scope.homeScreenTip = getToolTip.GetData('homeScreenTip');
    $scope.domainTip = getToolTip.GetData('domain');
    $scope.timeZoneTip = getToolTip.GetData('timeZone');
    $scope.splash = getToolTip.GetData('splash');
    $scope.homeScreen = getToolTip.GetData('homeScreen');
    $scope.startURL = getToolTip.GetData('startURL');
    $scope.bgColorTip = getToolTip.GetData('bgColor');
    $scope.themeColorTip = getToolTip.GetData('themeColor');
    $scope.rootElement = getToolTip.GetData('rootElement');
    $scope.description = getToolTip.GetData('description');
    $scope.startUrlErr = getMessage.GetData('manifest_startUrl_err');
    $scope.offlinetip = getToolTip.GetData('offline');
    $scope.dependenciesTip = getToolTip.GetData('dependencies');
    $scope.widelyHelp = getToolTip.GetData('widelyHelp');
    $scope.pswHelp = getToolTip.GetData('pswHelp');
    $scope.integrateHelp = getToolTip.GetData('integrateHelp');
    $scope.appSettingHelp = getToolTip.GetData('appSettingHelp');
    $scope.manifestHelp = getToolTip.GetData('manifestHelp');
    $scope.downloadManifestTip = getToolTip.GetData('downloadManifest');

    var controllerCode = function (ref, data) {
        var hashId = data.hashId;
        filterDate.show(false);
        $scope.hashId = hashId;
        console.log("hashId from config " + hashId);
        $scope.msg = {};
        $scope.appSettingMsg = {};
        $scope.urls = [];
        // load the config to show   

        dat = {
            hashId: hashId
        }
        $http.post("/getAppSettings", dat).success(function (result, status) {
            $scope.load = false; // disable loader
            if (result == "null") {
                $scope.load = false;
                $scope.config = {};
                $scope.config.manifest = {};
            } else {
                $scope.load = false;
                $scope.copyCode = true;
                $scope.config = result;
                //  console.log($scope.config);
            }
            if (!result.api_key) {
                $scope.validateButtonLabel = "Validate";
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'views/modals/client.appSetting.domain.modal.html',
                    controller: 'domainController',
                    size: 'sm',
                    backdrop: 'static',
                    resolve: {
                        data: function () {
                            return data = $scope.config;
                        },
                    }
                });
                if (data) {
                    $scope.config.manifest.start_url = data.manifest.start_url || "";
                    $scope.config.manifest.sort_name = data.manifest.sort_name || "";
                    $scope.config.manifest.name = data.manifest.name || "";
                    $scope.config.manifest.description = data.manifest.description;
                    $scope.config.domain = data.domain;
                    $scope.next = false;
                    $scope.next1 = true;
                    $scope.next2 = true;
                    $scope.next3 = true;
                    $scope.next4 = true;
                }
            } else {
                $scope.validateButtonLabel = "Update";
            }

        });
        var updateRef = ref.child('users').child(hashId).child('plugAndPlay');
        var conf = $firebaseObject(ref.child('users').child(hashId).child('config'));
        conf.$loaded().then(function (data) {
            $scope.data = data;
            var api_key = data.api_key;
            if (typeof (data.api_key) === 'undefined' || !api_key.length) {
                $scope.appSettingFilled = false;
                $scope.msg.appSetting = true;
                $scope.load = false;

            } else {
                $scope.appSettingFilled = true;
                $scope.bgColor = data.manifest.background_color;
                $scope.themeColor = data.manifest.theme_color;
                updateRef.once('value', function (prevData) {
                    $scope.$apply(function () {
                        var prefilledData = prevData.val();
                        if (prefilledData) {
                            $scope.offlineFlag = prefilledData.offline.custom || false;
                            $scope.customOffline = prefilledData.offline.pageUrl || '';
                            $scope.urls = prefilledData.offline.pageDependencies || [];
                            $scope.load = false;
                        } else {
                            $scope.load = false;
                        }
                    })
                });
            }
        });
        $scope.save = function () {
            $scope.load = true;
            var default_homeScreenUrl = $scope.config.manifest.default_homeScreenUrl; // image url for homeScreen
            var notificationUrl = $scope.config.notificationUrl; // image url for notification

            if (typeof (default_homeScreenUrl) === 'undefined' || default_homeScreenUrl == null) {
                default_homeScreenUrl = "";
            }
            if (typeof (notificationUrl) === 'undefined' || notificationUrl == null) {
                notificationUrl = "";
            }
            config = {
                API_KEY: $scope.config.api_key,
                project_no: $scope.config.project_no,
                notificationUrl: notificationUrl,
                hashId: hashId,
                domain: $scope.config.domain || "",
                timeZone: $scope.config.timeZone || '',
                manifest: {
                    name: $scope.config.manifest.name || "",
                    default_homeScreenUrl: default_homeScreenUrl,
                    sort_name: $scope.config.manifest.sort_name || '',
                    description: $scope.config.manifest.description || '',
                    start_url: $scope.config.manifest.start_url || '',
                    background_color: $scope.config.manifest.background_color || '',
                    theme_color: $scope.config.manifest.theme_color || '',
                    display: 'standalone',
                    orientation: 'portrait'
                }

            }
            var domain = $scope.config.domain || "";
            var offset = parseFloat($scope.config.timeZone) || 5.5;
            // update time on pwaMappings
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
                    var detail;
                    $scope.load = false;
                    $scope.isCollapsed = false;
                    $scope.appsettingSavedSucess = getMessage.GetData('appsetting_saved_sucess');
                    $scope.msg.success = true;
                    $scope.downloadManifest();
                } else {
                    $scope.load = false;
                    $scope.isCollapsed = false;
                    $scope.appsettingSavedFailure = getMessage.GetData('appsetting_saved_failure');
                    $scope.msg.failure = true;
                }
            })
        };
        $scope.validateAppSettings = function () {
            $scope.appSettingError = {};
            $scope.appSetting = {}
            $scope.appSettingMsg.failure = false;
            if ((!$scope.config.manifest.default_homeScreenUrl.startsWith('https') && !$scope.config.manifest.default_homeScreenUrl.startsWith('/')) || !(/\.(?:PNG|png|JPEG|JPG|jpg|jpeg)$/.test($scope.config.manifest.default_homeScreenUrl))) {
                $scope.appSettingError.homeError = getMessage.GetData('appSetting_homeicon_err');
                $scope.appSettingMsg.failure = true;
            }
            if ($scope.config.notificationUrl && !(/^https?:\/\/(?:[a-z0-9\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:PNG|png|JPEG|JPG|jpg|jpeg)$/.test($scope.config.notificationUrl))) {
                $scope.appSettingError.notificationErr = getMessage.GetData('appSetting_notification_err');
                $scope.appSettingMsg.failure = true;
            }
            if ($scope.config.domain && !$scope.config.domain.startsWith('https')) {
                $scope.appSettingError.domain = getMessage.GetData('appSetting_domain_err');
                $scope.appSettingMsg.failure = true;
            }
            if (!$scope.appSettingMsg.failure && !settingsForm.$invalid) {
                conf.$loaded().then(function (data) {
                    conf.api_key = $scope.config.api_key;
                    conf.project_no = $scope.config.project_no;
                    conf.notificationUrl = $scope.config.notificationUrl;
                    conf.domain = $scope.config.domain;
                    conf.timeZone = $scope.config.timeZone;
                    conf.manifest.default_homeScreenUrl = $scope.config.manifest.default_homeScreenUrl;
                    conf.$save().then(function (data) {
                        console.log("App Settings updated");
                        if ($scope.validateButtonLabel == "Validate") {
                            $scope.appSetting.success = getMessage.GetData('appSetting_validated');
                        }
                        else if ($scope.validateButtonLabel == "Update") {
                            $scope.appSetting.success=true;
                            $scope.appSetting.success = getMessage.GetData('appSetting_updated');
                        }
                    })
                });
            }
        };
        $scope.clickHead = function (input) {
            if (input == 'appSetting') {
                $scope.next = false;
                $scope.next1 = true;
                $scope.next2 = true;
                $scope.next3 = true;
                $scope.next4 = true;
            }
            else if (input == 'manifest') {
                $scope.next = true;
                $scope.next1 = false;
                $scope.next2 = true;
                $scope.next3 = true;
                $scope.next4 = true;
            }
            else if (input == 'serviceWorker') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = false;
                $scope.next3 = true;
                $scope.next4 = true;
            }
            else if (input == 'widely') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = true;
                $scope.next3 = false;
                $scope.next4 = true;
            }
            else if (input == 'integration') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = true;
                $scope.next3 = true;
                $scope.next4 = false;
            }

        };
        $scope.colapseHead = function (input) {
            if (input == 'appSetting') {
                $scope.next = true;
                $scope.next1 = false;
                $scope.next2 = true;
                $scope.next3 = true;
                $scope.next4 = true;
            }
            else if (input == 'manifest') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = false;
                $scope.next3 = true;
                $scope.next4 = true;
            }
            else if (input == 'serviceWorker') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = true;
                $scope.next3 = false;
                $scope.next4 = true;
            }
            else if (input == 'widely') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = true;
                $scope.next3 = true;
                $scope.next4 = false;
            }
            else if (input == 'integration') {
                $scope.next = true;
                $scope.next1 = true;
                $scope.next2 = true;
                $scope.next3 = true;
                $scope.next4 = true;
            }

        };
        $scope.downloadManifest = function () {
            $scope.load = true;
            console.log('inside download');
            // get data form firebase 
            ref.child('users').child(hashId).child('config').child('manifest').once('value', function (details) {
                var detail = details.val();

                //set data to send in the rest call
                var fileNameManifest = {
                    name: 'manifest.hbs'
                };

                // get the first file from server //rest call
                $http.get('/getFileToDownload', {
                    params: fileNameManifest
                }).then(function (manifest) {

                    //store the received data in local variable
                    var dataManifest = manifest.data;

                    //repalce the component as reaqiured in the file
                    dataManifest.name = detail.name;
                    dataManifest.icons[0].src = detail.default_homeScreenUrl;;
                    dataManifest.short_name = detail.sort_name;
                    dataManifest.background_color = detail.background_color;
                    dataManifest.description = detail.description;
                    dataManifest.display = detail.display;
                    dataManifest.orientation = detail.orientation;
                    dataManifest.start_url = detail.start_url;
                    dataManifest.theme_color = detail.theme_color;
                    dataManifest.gcm_sender_id = $scope.config.project_no;
                    //save first file on the user system 
                    var blob = new Blob([JSON.stringify(dataManifest, null, 2)], {
                        type: 'application/json'
                    });
                    saveAs(blob, "manifest.json");
                }, function (err) {
                    //err getting file form server
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    console.log('not able to get file form server :' + err);
                })
                $scope.load = false; //disable loader
            })
        };
        $scope.download = function () {
            $scope.load = true;
            $scope.saveData();
            console.log('inside download');

            // get data form firebase 
            ref.child('users').child(hashId).child('config').once('value', function (details) {
                var configData = details.val();
                if (configData) {
                    console.log("Configf", configData);
                    $scope.startUrl = configData.manifest.start_url;
                    if (!$scope.offlineFlag) {
                        $scope.urls = [];
                        $scope.customOffline = undefined;
                    }
                    if ($scope.urls.length == 1) {
                        $scope.singleDependency = $scope.urls[0];
                    }
                    else if ($scope.urls.length > 1) {
                        $scope.offlineDependencies = $scope.urls;
                    }
                    //for second file     
                    var fileNameSw = {
                        name: 'service-worker.hbs',
                        cacheName: configData.manifest.name + '001',
                        firbaseUrl: ref.toString(),
                        hashId: hashId,
                        defaultIcon: configData.manifest.notificationUrl || 'https://www.widely.io/resource/image/addToHome/launcher-icon-4x.png',
                        offlineDependencies: $scope.offlineDependencies,
                        offlineUrl: $scope.customOffline,
                        singleDependency: $scope.singleDependency,
                        startUrl: $scope.startUrl
                    }
                    // get the second file from server //rest call
                    $http.get('/getFileToDownload', {
                        params: fileNameSw
                    }).then(function (sw) {

                        //save second file on the user system 
                        var blob = new Blob([sw.data], {
                            type: 'text/javascript'
                        });
                        saveAs(blob, "service-worker.js");
                        $scope.offlineDependencies = "";
                        $scope.singleDependency = "";
                    }, function (err) {
                        //err getting file form server
                        $scope.load = false;
                        $scope.phd_errorMsg = getMessage.GetData('plugAndPlay_err');
                        $scope.phd_error = true;
                        console.log('not able to get file form server :' + err);
                    })
                    //file download completed
                    $scope.load = false; //disable loader
                } else {
                    $scope.load = false; //disable loader
                }

            })
        };
        $scope.addUrl = function () {
            if ($scope.offlineFlag) {
                $scope.urls.push($scope.pageUrl);
            }
            $scope.pageUrl = '';
        };
        $scope.removeUrl = function (item) {
            var index = $scope.urls.indexOf(item);
            if (index > -1) {
                $scope.urls.splice(index, 1);
            }
        };
        $scope.saveData = function () {
            $scope.load = true;
            var urlsObj = {};
            if ($scope.urls.length > 0) {
                for (var i = 0; i < $scope.urls.length; ++i) {
                    urlsObj[i] = $scope.urls[i];
                }
            }
            var data = {
                offline: {
                    pageUrl: $scope.customOffline || '',
                    custom: $scope.offlineFlag || false,
                    pageDependencies: urlsObj
                }
            }
            updateRef.update(data, function (error) {
                $scope.$apply(function () {
                    if (error) {
                        $scope.load = false;
                        console.log(error);
                        $scope.phd_errorMsg = getMessage.GetData('plugAndPlay_err');
                        $scope.phd_error = true;
                    } else {
                        $scope.load = false;
                        $scope.successMsg = getMessage.GetData('plugAndPlay_success');
                        $scope.msg.success = true;
                    }
                })
            });
        }
    };
    console.log("in app settings ");
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
};


