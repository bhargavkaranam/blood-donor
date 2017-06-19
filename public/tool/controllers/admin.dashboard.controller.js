angular.module('phive')
    .controller('admDashboardController', ['$scope','Auth', '$state', '$firebaseArray', '$http', 'getFirebaseRef', '$firebaseAuth', admDashboardController]);

function admDashboardController($scope,Auth, $state, $firebaseArray, $http,getFirebaseRef, $firebaseAuth) {

    $scope.auth = Auth;
    $scope.load = true;
    $scope.showView = false;
    
    // any time auth status updates, add the user data to scope
    $scope.auth.$onAuthStateChanged(function (authData) {
        $scope.authData = authData;

        if ($scope.authData === null) {
            $state.go('index'); 
        } else {
            var data = { 
                uid: authData.uid
            }
            $http.get('/validateAdm', { params: data }).then(function (success) {
                var ref = getFirebaseRef.ref;
                var fbAuth = getFirebaseRef.auth;
                if (success.data) {
                    // get hash ID  
                    $scope.authObj = $firebaseAuth(fbAuth);
                    var getHashId = $firebaseArray(ref.child('users').child('clientMapping'));
                    getHashId.$loaded().then(function (dataSnap) {
                        $scope.users = dataSnap; 
                        $scope.load = false;
                    }, function (err) {
                        console.log(err);
                    });

                    $scope.logout = function () {
                        $scope.authObj.$signOut();
                        // ref.unauth();
                        fbAuth.signOut();
                        $state.go('index');
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