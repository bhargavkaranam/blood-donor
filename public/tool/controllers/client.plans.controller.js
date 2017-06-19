var app = angular.module('phive');
app.controller('plansController', ['$scope', '$uibModal',
    '$firebaseObject', '$http', 'getMessage', 'getState',
    '$state', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', '$q', 'findName', plansController]);

function plansController($scope, $uibModal,
    $firebaseObject, $http, getMessage, getState, $state, $location, filterDate, breadCrumb, currentAuth, getEmailId, $q, findName) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    $scope.showMsg = false;
    $scope.plansMsg = {}
    $scope.currentPlanId;
    $scope.consumptionPercent;
    $scope.leftConsumption;
    $scope.cost = 0;
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = '';
    breadcrumbData.href_first = '';
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);
    var plans, obj;
    var selectedMAU;
    var selectedSubscribers;
    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var promises = [];
        // get hash ID
        var controllerCode = function (ref, data) {
            var hashId = data.hashId;
            filterDate.show(false);

            var getSubscriberCount = $http({
                method: 'GET',
                url: '/getSubscriberPlan'
            });
            promises.push(getSubscriberCount);

            // getMAUPlan
            var getMauPlan = $http({
                method: 'GET',
                url: '/getMauPlan'
            });
            promises.push(getMauPlan);

            $q.all(promises)
                .then(function (planRes) {
                    // subscribersPlan
                    var subscribers = planRes[0].data;
                    var subscriberkeys = Object.keys(subscribers);
                    var subscriberArr = [];
                    for (var i in subscriberkeys) {
                        var subscriber = {};
                        subscriber.key = subscriberkeys[i];
                        subscriber.val = subscribers[subscriber.key].cost;
                        subscriberArr.push(subscriber);
                    }
                    $scope.subscriberObjs = subscriberArr;
                    // MAU plan
                    var MAUsFromDB = planRes[1].data;
                    var maukeys = Object.keys(MAUsFromDB);
                    var MAUArr = [];
                    for (var i in maukeys) {
                        var MAU = {};
                        MAU.key = maukeys[i];
                        MAU.val = MAUsFromDB[maukeys[i]].cost;
                        MAUArr.push(MAU);
                    }
                    $scope.MAUObjs = MAUArr;
                    obj = $firebaseObject(ref.child('users').child(hashId).child('details').child('packageDetails').child('current'));
                    obj.$loaded()
                        .then(function (currentpkg) {
                            if (currentpkg != undefined) {
                                // $scope.monthlyUsers = {};
                                // $scope.subscriberCount = {};
                                $scope.cost = currentpkg.cost || 0;
                                selectedMAU = currentpkg.planMAU || 5000;
                                selectedSubscribers = currentpkg.planSubscriber || 1000;
                                $scope.load = false;
                                //TODO: checks pending
                                if ($scope.users) {
                                    var usersCost = $scope.users.val;
                                } else {
                                    var usersCost = 0;
                                }
                                if ($scope.subscribers) {
                                    var subscriberCost = $scope.subscribers.val;
                                } else {
                                    var subscriberCost = 0;
                                }
                                var mauIndex = $scope.MAUObjs.findIndex(getCurrentMau);
                                var subscriberIndex = $scope.subscriberObjs.findIndex(getCurrentSub);
                                if (typeof mauIndex != 'undefined' && typeof subscriberIndex != 'undefined') {
                                    $scope.users = $scope.MAUObjs[mauIndex];
                                    $scope.subscribers = $scope.subscriberObjs[subscriberIndex];
                                    $scope.cost = usersCost + subscriberCost;
                                }
                            }
                            else {
                                console.log('Package not applicable for hashId ' + hashId);
                                $scope.load = false;
                            }
                        })
                        .catch(function (error) {
                            console.error("Error:", error);
                        });
                })
                .catch(function (err) {
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                });

            $scope.applyDiscount = function (discountCoupon) {
                if (discountCoupon && discountCoupon.length <= 15) {
                    var discountData = {
                        hashId: hashId,
                        code: discountCoupon
                    }
                    $http.get('/applyCoupon', { params: discountData })
                        .then(function (success) {
                            if (success.data) {
                                console.log(success);
                                $scope.showMsg = true;
                                $scope.plansMsg.success = true;
                                $scope.infoSuccess = getMessage.GetData('discount_success');
                                console.log('Discount Added successfully');
                            }
                            else {
                                console.log('Invalid code not supported');
                                $scope.showMsg = true;
                                $scope.plansMsg.failure = true;
                                $scope.plansMsg.success = false;
                                $scope.load = false;
                                $scope.infoFailure = getMessage.GetData('register_invalid_code');
                            }
                        }, function (err) {
                            console.log(err);
                        })
                } else if (!discountCoupon) {
                    console.log('No discount coupon is applied');
                } else {
                    $scope.showMsg = true;
                    $scope.plansMsg.failure = true;
                    $scope.plansMsg.success = false;
                    $scope.load = false;
                    $scope.infoFailure = getMessage.GetData('register_invalid_code');
                    console.log('Invalid code');
                }
            };

            function getCurrentMau(element, index) {
                var tempIndex = index;
                if (parseInt(element.key) == selectedMAU) {
                    return tempIndex.toString();
                }
            }
            function getCurrentSub(element, index) {
                var subTemp = index;
                if (parseInt(element.key) == selectedSubscribers) {
                    return subTemp.toString();
                }
            }

            $scope.updateCost = function () {
                if ($scope.users) {
                    var usersCost = $scope.users.val;
                } else {
                    var usersCost = 0;
                }
                if ($scope.subscribers) {
                    var subscriberCost = $scope.subscribers.val;
                } else {
                    var subscriberCost = 0;
                }
                $scope.cost = usersCost + subscriberCost;
            };

            // polyfill findIndex
            if (!Array.prototype.findIndex) {
                Object.defineProperty(Array.prototype, 'findIndex', {
                    value: function (predicate) {
                        // 1. Let O be ? ToObject(this value).
                        if (this == null) {
                            throw new TypeError('"this" is null or not defined');
                        }

                        var o = Object(this);

                        // 2. Let len be ? ToLength(? Get(O, "length")).
                        var len = o.length >>> 0;

                        // 3. If IsCallable(predicate) is false, throw a TypeError exception.
                        if (typeof predicate !== 'function') {
                            throw new TypeError('predicate must be a function');
                        }

                        // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
                        var thisArg = arguments[1];

                        // 5. Let k be 0.
                        var k = 0;

                        // 6. Repeat, while k < len
                        while (k < len) {
                            // a. Let Pk be ! ToString(k).
                            // b. Let kValue be ? Get(O, Pk).
                            // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                            // d. If testResult is true, return k.
                            var kValue = o[k];
                            if (predicate.call(thisArg, kValue, k, o)) {
                                return k;
                            }
                            // e. Increase k by 1.
                            k++;
                        }

                        // 7. Return -1.
                        return -1;
                    }
                });
            };

            $scope.computeCost = function () {
                if ($scope.users.hasOwnProperty('val') && $scope.subscribers.hasOwnProperty('val')) {
                    $scope.load = true;
                    // obj.planMAU = parseInt($scope.users.key);
                    // obj.planSubscriber = parseInt($scope.subscribers.key);
                    // obj.cost = $scope.users.val + $scope.subscribers.val;
                    var email = getEmailId.getEmail(currentAuth);
                    if ($scope.users) {
                        var usersCost = $scope.users.val;
                    } else {
                        var usersCost = 0;
                    }
                    if ($scope.subscribers) {
                        var subscriberCost = $scope.subscribers.val;
                    } else {
                        var subscriberCost = 0;
                    }

                    // get user name
                    var promise = $q(function (resolve, reject) {
                        findName.getName(hashId, currentAuth, 'mktAdmin').then(resolve);
                    }).then(function (username) {
                        var dataSend = {
                            hashId: hashId,
                            email: email,
                            planMAU: parseInt($scope.users.key),
                            planSubscriber: parseInt($scope.subscribers.key),
                            cost: usersCost + subscriberCost,
                            name: username
                        }

                        $http.get('/applyCost', {
                            params: dataSend
                        }).then(function (response) {
                            console.log(response);
                            if (response) {
                                $scope.load = false;
                                $scope.showMsg = true;
                                $scope.plansMsg.success = true;
                                $scope.infoSuccess = getMessage.GetData('plan_success');
                            }
                        })
                            .catch(function (err) {
                                console.log(err);
                                $scope.load = false;
                                $scope.showMsg = true;
                                $scope.plansMsg.failure = true;
                                $scope.infoFailure = getMessage.GetData('plan_failure');
                            })
                    })


                    // obj.$save().then(function (ref) {
                    //     $scope.load = false;
                    //     $scope.showMsg = true;
                    //     $scope.plansMsg.success = true;
                    //     $scope.infoSuccess = getMessage.GetData('plan_success');
                    // }, function (error) {
                    //     $scope.load = false;
                    //     $scope.showMsg = true;
                    //     $scope.plansMsg.failure = true;
                    //     $scope.infoFailure = getMessage.GetData('plan_failure');
                    // });

                }
            };

        };

        var email = getEmailId.getEmail(currentAuth);

        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}