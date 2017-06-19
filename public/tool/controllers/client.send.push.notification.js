
angular.module('phive').controller('sendPushNotification', ['$scope', '$firebaseObject', 'productId', '$firebaseArray', 'getFirebaseRef', 'getMessage',
    'getState', '$state', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', sendPushNotification]);

function sendPushNotification($scope, $firebaseObject, productId,
    $firebaseArray, getFirebaseRef, getMessage, getState, $state, $location, filterDate, breadCrumb, currentAuth, getEmailId) {
    "use strict";
    window.sessionStorage.setItem('currentPage', $location.path());
    //   $scope.result = false;
    $scope.menSign = "";
    $scope.msg = {};
    $scope.isCollapsed = true;

    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Actions /';
    breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
    breadcrumbData.href_first = '#' + $location.$$url;
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    $scope.showNotificationPreview = false;
    $scope.load = true;
    // $scope.disableDir = false;

    var uid;
    var checkAuth = currentAuth;
    // any time auth status updates, add the user data to scope
    if (checkAuth === null) {
        $state.go('index');
    } else {
        uid = checkAuth.uid;
        var ref = getFirebaseRef.ref;
        var controllerCode = function (ref, data) {
            var hashId = data.hashId;
            filterDate.show(false);
            $scope.arr = [];
            $scope.modernBrowsers = [];
            var subscriberCount;
            $scope.showSend = true;
            var id = productId.getproductId();
            $scope.field = {};
            var subscribers = $firebaseObject(ref.child('users').child(hashId).child('userInsights').child('user').child('subscribersCount'));
            subscribers.$loaded().then(function (x) {
                subscriberCount = x.$value;
                if (subscriberCount < 1) {
                    $scope.showSend = false;
                    $scope.load = false;
                    $scope.noSubMsg = getMessage.GetData('send_push_noSub');
                    $scope.msg.noSub = true;
                    $scope.isCollapsed = false;
                }
            }).catch(function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.log("Error:", error);
            });
            var groupObj = $firebaseArray(ref.child('users').child(hashId).child('segments'));
            groupObj.$loaded().then(function (data) {

                $scope.load = false;
                for (var i in data) {

                    if (typeof data[i].segmentName !== 'undefined' && !(data[i].subType === 'all')) {
                        $scope.modernBrowsers.push({
                            name: data[i].segmentName,
                            ticked: false,
                            type: data[i].type,
                            subType: data[i].subType ? data[i].subType : "NA"
                        });
                    }
                }
            }).catch(function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.error("Error:", error);
            });

            // get data from templates   
            if (typeof id !== "undefined" && id !== null) {

                var campaignId = id.$id;
                console.log("id of template " + id.$id);

                $scope.field.Ctitle = id.Ctitle;
                $scope.field.title = id.title;
                $scope.field.content = id.content;
                $scope.field.lurl = id.lurl;
                $scope.field.icon_url = id.imageUrl;
                $scope.field.campaignId = campaignId;

                productId.setProductId(null);
            } else {
                // no template used

                $scope.field.campaignId = 0;
                $scope.load = true;
                // set default icon url
                var notification_obj = $firebaseObject(ref.child('users').child(hashId).child('config').child('notificationUrl'));
                notification_obj.$loaded().then(function (data) {
                    $scope.load = false;
                    $scope.field.icon_url = data.$value;
                }, function (err) {
                    $scope.load = false;
                    console.log(err);
                });
            }

            $scope.triggerNotify = function () {
                var containAll = false;
                $scope.load = true;
                var outputArr, launchUrl;
                var updatedArray = $firebaseArray(ref.child('users').child(hashId).child('posts'));

                // if (typeof $scope.field.lurl === 'undefined') {
                //     $scope.field.lurl = "";
                // } // remove this 
                if (typeof $scope.field.Ctitle === 'undefined') {
                    $scope.field.Ctitle = "";
                }

                if (typeof $scope.field.content === 'undefined') {
                    $scope.field.content = "";
                }
                if ($scope.checkBoxUtm) {

                    launchUrl = $scope.field.lurl + '/?utm_source=' + $scope.utm_source + '&utm_medium=' + $scope.utm_medium + '&utm_campaign=' + $scope.utm_campaign + '&widely_badge=true';

                    if (!(typeof $scope.utm_term === 'undefined')) {
                        launchUrl += '&utm_term=' + $scope.utm_term;
                    }
                    if (!(typeof $scope.utm_content === 'undefined')) {
                        launchUrl += '&utm_content=' + $scope.utm_content;
                    }
                } else {
                    launchUrl = $scope.field.lurl + '/?widely_badge=true';
                }
                if ($scope.allUsers) {
                    var allUserData = [{
                        name: 'All Users',
                        subType: 'all',
                        ticked: true,
                        type: 'all'
                    }];
                    outputArr = allUserData;
                } else {
                    outputArr = $scope.outputBrowsers;
                }

                for (var i in outputArr) {

                    if (outputArr[i].subType == 'all' && outputArr.length >= 2) {
                        containAll = true;
                        break;
                    }
                }
                if (outputArr.length <= 0) {

                    // $scope.result = true;
                    $scope.load = false;
                    $scope.noSegSelectedMsg = getMessage.GetData('send_no_seg_selected');
                    $scope.msg.noSegment = true;
                    $scope.isCollapsed = false;
                } else if (containAll) {
                    // All segment selected
                    $scope.load = false;
                    $scope.containAllMsg = getMessage.GetData('send_containAllMsg');
                    $scope.msg.containAll = true;
                    $scope.isCollapsed = false;
                } else {

                    $scope.isCollapsed = true;
                    $scope.field.timeStamp = global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP;

                    var obj = {
                        title: $scope.field.title,
                        content: $scope.field.content,
                        campaignId: $scope.field.campaignId,
                        group: outputArr,
                        timeStamp: $scope.field.timeStamp,
                        Ctitle: $scope.field.Ctitle,
                        isSent: false
                    };

                    if (typeof launchUrl != 'undefined' && launchUrl.length > 0) {
                        obj.url = $scope.field.lurl;
                    }

                    if (typeof $scope.field.icon_url != 'undefined' && $scope.field.icon_url.length > 0) {
                        obj.icon_url = $scope.field.icon_url;
                    }
                    
                    //TODO : checks in group selected in future
                    var subscribers = $firebaseObject(ref.child('users').child(hashId).child('userInsights').child('user').child('subscribersCount'));
                    subscribers.$loaded().then(function (x) {

                        subscriberCount = x.$value;

                        if (subscriberCount >= 1) {
                            // create new post 
                            updatedArray.$add(obj).then(function (dat) {
                                $scope.load = false;
                                $scope.sendPushSuccess = getMessage.GetData('send_push_sucess');
                                $scope.isCollapsed = false;
                                $scope.msg.success = true;
                            })
                                .catch(function (err) {
                                    console.log(err);
                                    $scope.load = false;
                                    $scope.phd_error = true;
                                    $scope.phd_errorMsg = getMessage.GetData('error');
                                })
                        }
                        else {
                            // no subscribers present
                            $scope.load = false;
                            $scope.noSubMsg = getMessage.GetData('send_push_noSub');
                            $scope.msg.noSub = true;
                            $scope.isCollapsed = false;
                        }
                    })
                        .catch(function (error) {
                            $scope.$apply(function () {
                                $scope.load = false;
                                $scope.phd_errorMsg = getMessage.GetData('error');
                                $scope.phd_error = true;
                                console.log("Error:", error);
                            })
                        });
                }
            };
            //menSignFun()
            $scope.menSignFun = function () {
                if ($scope.checkBoxUtm) {
                    $scope.menSign = "*";
                } else {
                    $scope.menSign = "";
                }
            };
        };
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}
