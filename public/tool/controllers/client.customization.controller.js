angular.module('phive')
    .controller('customizationController', ['currentAuth', '$state', 'getState', '$scope', 'getFirebaseRef', '$location', 'breadCrumb', 'getEmailId', '$firebaseObject', 'getMessage', 'getToolTip',customizationController]);

function customizationController(currentAuth, $state, getState, $scope, getFirebaseRef, $location, breadCrumb, getEmailId, $firebaseObject, getMessage,getToolTip) {
    $scope.load = true;
    $scope.msg = {};
    var ref = getFirebaseRef.ref;
    $scope.next = false;
    $scope.next1 = true;

    window.sessionStorage.setItem('currentPage', $location.path());
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = "";
    breadcrumbData.href_first = "";
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    $scope.customize_notification_type=getToolTip.GetData('customize_notification_type');
    $scope.customize_notification_bellColor=getToolTip.GetData('customize_notification_bellColor');
    $scope.customize_notification_bellPstn=getToolTip.GetData('customize_notification_bellPstn');
    $scope.customize_notification_popUpPstn=getToolTip.GetData('customize_notification_popUpPstn');
    $scope.customize_notification_popUpContent=getToolTip.GetData('customize_notification_popUpContent');
   
    $scope.customize_popUpTheme=getToolTip.GetData('customize_popUpTheme');
    $scope.customize_popUpBgColor=getToolTip.GetData('customize_popUpBgColor');
    $scope.customize_popUpBtnColor=getToolTip.GetData('customize_popUpBtnColor');
    $scope.customize_popUpFont=getToolTip.GetData('customize_popUpFont');
    $scope.customize_popUpFontColor=getToolTip.GetData('customize_popUpFontColor');
    
    $scope.customize_offpopUpBgColor=getToolTip.GetData('customize_offpopUpBgColor');
    $scope.customize_offpopUpFont=getToolTip.GetData('customize_offpopUpFont');
    $scope.customize_offpopUpFontColor=getToolTip.GetData('customize_offpopUpFontColor');
    $scope.customize_offlineContent=getToolTip.GetData('customize_offlineContent');
    $scope.customize_notification_offPopUpPstn=getToolTip.GetData('customize_notification_offPopUpPstn');


    if (currentAuth === null) {
        $state.go('index');
    } else {
        $scope.notification = {};
        $scope.notification.popUp = {};
        $scope.notification.bell = {};
        $scope.offline = {};
        $scope.offline.popUp = {};
        var email = getEmailId.getEmail(currentAuth);
        var controllerCode = function (ref, data) {
            var hashId = data.hashId;
            var customizeData = $firebaseObject(ref.child('users').child(hashId).child('pwaMappings'));
            customizeData.$loaded(
                function (data) {
                    if (data.customize != undefined && data.customize.views != undefined && data.customize.views.notification != undefined) {
                        $scope.notification.type = data.customize.views.notification.type;
                        if ($scope.notification.type == 'popUp') {
                            $scope.notification.popUp.position = data.customize.views.notification.position;
                            $scope.notification.popUp.content = data.customize.views.notification.content;
                            if (data.customize.views.theme != undefined) {
                                $scope.notification.popUp.theme = true;
                                $scope.notification.popUp.bgColor = data.customize.views.theme.custom.background_color;
                                $scope.notification.popUp.btnColor = data.customize.views.theme.custom.btn_color;
                                $scope.notification.popUp.font = data.customize.views.theme.custom.font_family;
                                $scope.notification.popUp.fntColor = data.customize.views.theme.custom.font_color;
                            }
                        }
                        else if ($scope.notification.type == 'bell') {
                            $scope.notification.bell.position = data.customize.views.notification.position;
                            $scope.notification.bell.color = data.customize.views.theme.custom.bell_color;
                        }
                        if ($scope.notification.type != 'popUp') {
                            $scope.notification.default={};
                            $scope.notification.default.bgColor = data.customize.views.theme.custom.background_color;
                            $scope.notification.default.fntColor = data.customize.views.theme.custom.font_color;
                            $scope.notification.default.font = data.customize.views.theme.custom.font_family;
                        }
                    }
                    if (data.customize != undefined && data.customize.views.offline != undefined) {
                        $scope.offline.enable = true;
                        $scope.offline.popUp.content = data.customize.views.offline.content;
                        $scope.offline.popUp.position = data.customize.views.offline.position;
                    }
                }, function (error) {
                    console.log("Error Ocurred while getting customization data", error);
                }
            );
            $scope.customNotify = function (customize) {
                var notificationType = $scope.notification.type;
                if (notificationType) {
                    customize.views.notification = {};
                    customize.views.notification.type = notificationType;
                    customize.views.theme = {};
                    customize.views.theme.custom = {};
                    if (notificationType == 'popUp') {
                        customize.views.notification.content = $scope.notification.popUp.content;
                        customize.views.notification.position = $scope.notification.popUp.position;
                        if ($scope.notification.popUp.theme) {
                            customize.views.theme.type = 'custom';
                            customize.views.theme.custom.background_color = $scope.notification.popUp.bgColor;
                            customize.views.theme.custom.font_color = $scope.notification.popUp.fntColor;
                            customize.views.theme.custom.btn_color = $scope.notification.popUp.btnColor;
                            customize.views.theme.custom.font_family = $scope.notification.popUp.font;
                        }
                    }
                    else if (notificationType == 'bell') {
                        customize.views.theme.type = 'custom';
                        customize.views.theme.custom.bell_color = $scope.notification.bell.color;
                        customize.views.notification.position = $scope.notification.bell.position;
                    }
                    if (notificationType != 'popUp') {
                        customize.views.theme.type = 'custom';
                        customize.views.theme.custom.background_color = $scope.notification.default.bgColor;
                        customize.views.theme.custom.font_color = $scope.notification.default.fntColor;
                        customize.views.theme.custom.btn_color = "#444";
                        customize.views.theme.custom.font_family = $scope.notification.default.font;
                    }
                }
                return customize;
            };
            $scope.customOffline = function (customize) {
                if ($scope.offline.enable) {
                    customize.views.offline = {};
                    customize.views.offline.content = $scope.offline.popUp.content;
                    customize.views.offline.position = $scope.offline.popUp.position;
                }
                else {
                    customize.views.offline = false;
                }
                return customize;
            };
            $scope.save = function () {
                customizeData.$loaded(
                    function (data) {
                        var customize = {};
                        customize.service_worker_url = './service-worker.js';
                        customize.hashId = hashId;
                        customize.views = {};
                        if (data.customize == undefined) {
                            customize = $scope.customNotify(customize);
                            customize = $scope.customOffline(customize);
                            customizeData.customize = customize;
                            customizeData.$save().then(function (data) {
                                console.log("customization details added");
                                $scope.result = true;
                                $scope.load = false;
                                $scope.msg = getMessage.GetData('customization_success');
                            })
                        }
                        else {
                            console.log("customization details added");
                            customize = $scope.customNotify(customize);
                            customize = $scope.customOffline(customize);
                            customizeData.customize = customize;
                            customizeData.$save().then(function (data) {
                                console.log("customization details updated");
                                $scope.result = true;
                                $scope.load = false;
                                $scope.msg = getMessage.GetData('customization_success');
                            })
                        }
                    }, function (error) {
                        console.error("Error while creating customization node", error);
                    }
                );
            };
        };
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}