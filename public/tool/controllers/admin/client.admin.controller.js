var app = angular.module('phive');

app.controller('adminController', ['$scope', '$state', '$firebaseObject', 'breadCrumb', 'getEmailId', 'currentAuth','getFirebaseRef','$firebaseAuth',
    function ($scope, $state, $firebaseObject, breadCrumb, getEmailId, currentAuth, getFirebaseRef, $firebaseAuth) {
        $scope.authData = currentAuth;
        $scope.load = true;
        var ref = getFirebaseRef.ref;
        // any time auth status updates, add the user data to scope

        $scope.logo = "assets/img/logo.png";
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var obj = $firebaseObject(ref.child('users/clientMapping').child(key))
            obj.$loaded()
                .then(function (data) {
                    $scope.load = false;
                    if (data.seller) {
                        $scope.keys = Object.keys(data.seller);
                        $scope.organization = data.seller;
                       //  $firebaseAuth(ref).$unauth();
                        
                    }
                })
        }

        console.log('index');
        if (!currentAuth) {
            $state.go('index');
        }
    }
]);