angular.module('phive')
    .controller('admUserdetailsController', ['Auth', '$state', '$firebaseArray', '$http', '$scope', 'getFirebaseRef', '$firebaseAuth', '$location', admUserdetailsController]);

function admUserdetailsController(Auth, $state, $firebaseArray, $http, $scope, getFirebaseRef, $firebaseAuth, $location) {

    $scope.auth = Auth;
    $scope.load = true;
    $scope.msg = {};
    var ref = getFirebaseRef.ref;
    var fbAuth = getFirebaseRef.auth;

    // any time auth status updates, add the user data to scope
    $scope.auth.onAuthStateChanged(function (authData) {
        $scope.authData = authData;

        if ($scope.authData === null) {
            $state.go('index');
        } else {
            window.sessionStorage.setItem('currentPage', $location.path());
            var data = {
                uid: authData.uid
            }
            $http.get('/validateAdm', { params: data }).then(function (success) {
                if (success.data) {
                    // get hash ID 
                    var hashId = $location.search().hashId;
                    $scope.authObj = $firebaseAuth(fbAuth);
                    $scope.seletedPlan;
                    $scope.packageDetails;
                    $scope.packages;
                    $scope.load = false;
                    $firebaseArray(ref.child('users').child('plans')).$loaded().then(function (plans) {
                        $scope.packages = plans;
                    }, function (err) {
                        console.log('err getting plan from plan node :-' + err);
                    })

                    var getPackageDetails = ref.child('users').child(hashId).child('details').child('packageDetails').child('current');
                    getPackageDetails.on('value', function (dataSnap) {
                        $scope.packageDetails = dataSnap.val();
                    }, function (err) {
                        console.log(err);
                    });

                    $scope.logout = function () {
                        $scope.authObj.$signOut();
                        // ref.unauth();
                        fbAuth.signOut();
                        $state.go('index');
                    }
                    $scope.upgrade = function () {
                        $scope.load = true;
                        data = {
                            planChangeData: {
                                planId: $scope.seletedPlan.$id,
                                hashId: hashId,
                                dataPoints: $scope.seletedPlan.dataPoints,
                                packageName: $scope.seletedPlan.planName,
                                cost: $scope.seletedPlan.cost,
                                maxDeveloper: 1,
                                maxMarketer: 2,
                                mail: false
                            }
                        }
                        $http({
                            method: 'POST',
                            url: '/upgradePlan',
                            data: data
                        }).then(function successCallback(response) {
                            $scope.seletedPlan = false;
                            $scope.load = false;
                            $scope.msg.success = true;
                            console.log('done')
                        }, function (err) {
                            $scope.load = false;
                            $scope.msg.err = true;
                            console.log(err);
                        })
                    }
                }
                else {
                    $state.go('index');
                }
            }, function (err) {
                console.log(err);
            })



        }
    })
}