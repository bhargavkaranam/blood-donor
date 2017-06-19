
var app = angular.module('phive');
app.controller('segmentsController', ['$scope','$firebaseArray',
    '$firebaseObject', '$state', 'getMessage', 'getState', 'filterDate', 'breadCrumb', '$uibModal', '$location', 'currentAuth', 'getEmailId', segmentsController]);

function segmentsController($scope, $firebaseArray, $firebaseObject,
    $state, getMessage, getState, filterDate, breadCrumb, $uibModal, $location, currentAuth, getEmailId) {

    $scope.filter = {};
    $scope.items = [];
    $scope.load = true;
    $scope.show = false;

    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = 'Actions /';
    breadcrumbData.bCrumblink_first = 'Subscriber Segments';
    breadcrumbData.href_first = '#/subscriber-segments';
    breadcrumbData.bCrumbForSecElement = getState.GetData($state.current.name);
    breadcrumbData.hrefForSecElement = '#' + $location.$$url;
    breadCrumb.setbreadCrumbData(breadcrumbData);

    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');

    } else {
        $scope.msg = {};
        // get hash ID  
    var controllerCode = function (ref, data) {
        var hashId=data.hashId;
        filterDate.show(false);
        $scope.updateSubType = function () {
            $scope.items.length = 0;
            var filter = $scope.filter.segment.type;
            var keys = Object.keys(filter);
            for (var i in keys) {
                if (!keys[i].startsWith('$')) {
                    $scope.items.push({
                        name: keys[i],
                        id: parseInt(i) + 1
                    })
                }
            }
            $scope.hideSubtype = false;
            $scope.subRequired = true;

        }
        var subscribers = $firebaseArray(ref.child('users').child(hashId).child('subscriber'));
        subscribers.$loaded()
            .then(function (x) {
                subscriberCount = x.length;
                if (subscriberCount < 1) {
                    $scope.noSub = true;
                    $scope.errMsg = getMessage.GetData('segment_no_sub');
                    $scope.msg.err = true;
                    $scope.show = true;
                    $scope.filter = null;
                    $scope.load = false;
                }
            })
            .catch(function (error) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.log("Error:", error);
            });

        var segmentData = $firebaseArray(ref.child('users').child(hashId).child('segmentFilters'));
        segmentData.$loaded()
            .then(function (filter) {
                console.log(filter);
                $scope.keys = filter;
                $scope.load = false;
            })
        $scope.createSegment = function () {
            $scope.load = true;
            var groupName = $scope.filter.groupName;
            var subType = $scope.selected.name;
            var isExist = false;
            var segment_name = '';
            // $scope.isExist = $scope.checkSegment($scope.filter.segment.type.$id, subType);
            var segmentRef = $firebaseArray(ref.child('users').child(hashId).child('segments').orderByChild('type').equalTo($scope.filter.segment.type.$id));
            segmentRef.$loaded().then(function (segData) {
                console.log(segData);
                for (var i = 0; i < segData.length; i++) {
                    if (segData[i].subType === subType) {
                        var segment_name = segData[i].segmentName;
                        // $scope.alreadyExistMsg = 'Segment "' + segData[i].segmentName + '" already exist with same configuration. Are you sure you want create?';
                        isExist = true;
                        break;
                    }
                    isExist = false;
                }
                if (isExist) {
                    $scope.load = false;
                    var modalInstance = $uibModal.open({
                        animation: $scope.animationsEnabled,
                        templateUrl: 'views/modals/segmentExist.modal.html',
                        controller: 'segmentExistController',
                        size: 'sm',
                        backdrop: 'static',
                        resolve: {
                            data: function () {
                                return segment_name;
                            },

                        }
                    });

                    modalInstance.result.then(function (res) {
                        if (res) {
                            $scope.load = true;
                            $scope.updateSegment();
                        }
                    }, function () {
                        // $scope.filter = null;
                        console.log('segment creation aborted by user');
                    })
                }
                else {
                    $scope.updateSegment();
                }
                // return false;
            }, function (err) {
                console.log(err);
            });

            // update segments
        }
        $scope.updateSegment = function () {
            var groupName = $scope.filter.groupName;
            var subType = $scope.selected.name;
            var segArr = $firebaseArray(ref.child('users').child(hashId).child('segments'));

            if (subType) {
                var segObj = {
                    type: $scope.filter.segment.type.$id,
                    subType: subType,
                    segmentName: groupName
                }
            }
            else {

                var segObj = {
                    type: $scope.filter.segment.type.$id,
                    segmentName: groupName
                }

            }

            segArr.$add(segObj).then(function (ref) {

                // $scope.result = true;
                // $scope.msg = "";
                $scope.successMsg = getMessage.GetData('segment_success');
                $scope.msg.success = true;
                $scope.show = true;
                $scope.filter = null;
                $scope.load = false;
            }, function (err) {
                console.log(err);
                $scope.successMsg = getMessage.GetData('segment_err');
                $scope.msg.err = true;
                $scope.show = true;
                $scope.load = false;
            });

        };
    };

        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

 }