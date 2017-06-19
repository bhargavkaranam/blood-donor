'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var app = angular.module('phive');
app.controller('abTestController', ['$scope', 'config', '$firebaseArray', '$firebaseObject', 'getFirebaseRef', '$state', 'productService', 'getMessage', 'getState', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', abTestController]);

function abTestController($scope, config, $firebaseArray, $firebaseObject, getFirebaseRef, $state, productService, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;

    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Actions/';
    breadcrumbData.bCrumblink_first = 'A-B Split Testing';
    breadcrumbData.href_first = '#/dashboard/ab-split-testing';
    breadcrumbData.bCrumbForSecElement = getState.GetData($state.current.name);
    breadcrumbData.hrefForSecElement = '#' + $location.$$url;
    breadCrumb.setbreadCrumbData(breadcrumbData);

    var controllerCode = function (ref, data) {
        var hashId=data.hashId
        filterDate.show(false);
        $scope.fieldB = {};
        $scope.fieldA = {};
        $scope.field = {};
        $scope.msg = {};
        $scope.sendDisable = false;

        $scope.modernBrowsers = [];
        var subscribers = $firebaseArray(ref.child('users').child(hashId).child('subscriber'));
        subscribers.$loaded().then(function (x) {
            var subscriberCount = x.length;
            // if (subscriberCount < 6) {
            if (subscriberCount < 1) {
                $scope.noSubscriber = true;
                $scope.msg.noSub = true;
                $scope.noSub = getMessage.GetData('abTest_noSub');
                $scope.show = true;
                $scope.load = false;
            } else {
                var groupObj = $firebaseArray(ref.child('users').child(hashId).child('segments'));
                groupObj.$loaded().then(function (data) {

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
                    $scope.load = false;
                }).catch(function (error) {
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    console.error("Error:", error);
                });
                var templates = productService.template(hashId);
                templates.$loaded().then(function (temp) {
                    $scope.load = false; // disable loader
                    if (temp.length == 0) {
                        console.log(' you have no campaign ');
                        $scope.noCamp = getMessage.GetData('abTest_noCamp');
                        $scope.msg.noCamp = true;
                        $scope.show = true;
                        $scope.load = false;
                    } else {
                        $scope.camp = temp;
                        $scope.load = false;
                    }
                }, function (err) {
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    console.log(err);
                });

                $scope.sendAB = function () {
                    $scope.load = true;
                    if ($scope.allUsers) {
                        var allUserData = [{
                            name: 'All Users',
                            subType: 'all',
                            ticked: true,
                            type: 'all'
                        }];
                        var outputArr = allUserData;
                    } else {
                        var outputArr = $scope.outputBrowsers;
                    }
                    if (outputArr.length <= 0) {
                        //
                        //no segments seleted 
                        //
                        $scope.noSeg = getMessage.GetData('abTest_noSeg');
                        $scope.msg.noSeg = true;
                        $scope.show = true;
                        console.log('no segment seleted');
                        $scope.load = false;
                    } else {
                        var _testsObj;

                        var testName = $scope.field.testName || '';
                        var uniqueId = ref.push().key;
                        var update = ref.child('users').child(hashId).child('AbTesting').child(uniqueId);
                        var updateref = $firebaseObject(update);
                        var postIdTestA = ref.push().key;
                        var postIdTestB = ref.push().key;
                        //     var obj = {
                        var detailsObj = {
                            name: testName,
                            timeStamp: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                            status: 'Done'
                            //
                            //status will be changed when story done
                            //
                        };

                        var testsObj = (_testsObj = {}, _defineProperty(_testsObj, ref.push().key, {
                            name: 'TestA',
                            postId: postIdTestA
                        }), _defineProperty(_testsObj, ref.push().key, {
                            name: 'TestB',
                            postId: postIdTestB
                        }), _testsObj);
                        //   }
                        // updateref.obj;
                        updateref.details = detailsObj;
                        updateref.tests = testsObj;

                        updateref.$save().then(function (success) {
                            var _postObj;

                            console.log('data updated');
                            var postObj = (_postObj = {}, _defineProperty(_postObj, postIdTestA, {
                                title: $scope.fieldA.title || '',
                                content: $scope.fieldA.content || '',
                                url: $scope.fieldA.lurl || '',
                                campaignId: $scope.field.campaignA.$id || '',
                                group: outputArr,
                                sentToTotalUsers: 0,
                                conversionRate: 0,
                                clickDelivery: 0,
                                trackDelivery: 0,
                                timeStamp: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                                Ctitle: $scope.fieldA.Ctitle || '',
                                icon_url: $scope.fieldA.icon_url || '',
                                isSent: false,
                                testId: uniqueId,
                                testType: 'testA'
                            }), _defineProperty(_postObj, postIdTestB, {
                                title: $scope.fieldB.title || '',
                                content: $scope.fieldB.content || '',
                                url: $scope.fieldB.lurl || '',
                                campaignId: $scope.field.campaignB.$id || '',
                                group: outputArr,
                                timeStamp: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                                Ctitle: $scope.fieldB.Ctitle || '',
                                icon_url: $scope.fieldB.icon_url || '',
                                isSent: false,
                                testId: uniqueId,
                                testType: 'testB'
                            }), _postObj);
                            var onComplete = function onComplete(error) {
                                if (error) {
                                    $scope.err = getMessage.GetData('abTest_err');
                                    $scope.msg.err = true;
                                    $scope.show = true;
                                    console.log('not able to update data ' + err);
                                    $scope.load = false;
                                } else {
                                    $scope.msg.success = true;
                                    $scope.success = getMessage.GetData('abTest_success');
                                    $scope.show = true;
                                    console.log('post data updated');
                                    $scope.load = false;
                                }
                            };
                            var updateRef = ref.child('users').child(hashId).child('posts');;
                            updateRef.update(postObj, onComplete);
                        }, function (err) {
                            $scope.err = getMessage.GetData('abTest_err');
                            $scope.msg.err = true;
                            $scope.show = true;
                            console.log('not able to update data ' + err);
                            $scope.load = false;
                        });
                    }
                };
                $scope.bindCampData = function (changedTest) {
                    $scope.fieldA = $scope.field.campaignA;
                    $scope.fieldB = $scope.field.campaignB;
                    if ($scope.fieldA && $scope.fieldB) {
                        if ($scope.fieldA.$id === $scope.fieldB.$id) {
                            //
                            //selected same campaign
                            //
                            $scope.sendDisable = true;
                            $scope.err = getMessage.GetData('abTest_same_camp');
                            $scope.msg.err = true;
                            $scope.show = true;
                        } else {
                            $scope.msg.err = false;
                            $scope.show = false;
                            $scope.sendDisable = false;
                        }
                    } else {
                        $scope.msg.err = false;
                        $scope.show = false;
                        $scope.sendDisable = false;
                    }


                };
            }
        });
    };
    // any time auth status updates, add the user data to scope

    if (currentAuth === null) {
        $state.go('index');
    } else {
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}