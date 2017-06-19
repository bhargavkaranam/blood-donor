'use strict';
angular.module('phive').controller('deactivatedUser', ['$scope', 'getFirebaseRef', '$firebaseObject', '$state', 'currentAuth', 'getEmailId', deactivatedUser]);

function deactivatedUser($scope, getFirebaseRef, $firebaseObject, $state, currentAuth, getEmailId) {
    $scope.load = true;
    $scope.show = false;
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var ref = getFirebaseRef.ref;
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var obj = $firebaseObject(ref.child('users/clientMapping/').child(key));
            obj.$loaded()
                .then(function (data) {
                    var hashId = data.hashId;
                    var getClientStatus = $firebaseObject(ref.child('users').child(hashId).child('clientUsers').child('clientStatus'));
                    getClientStatus.$loaded(function (clientStatusData) {
                        var clientStatus = clientStatusData.$value || false;
                        if (!clientStatus) {
                            $scope.load = false;
                            $scope.show = true;
                        }
                        else {
                            $state.go('dashboard');
                        }
                    })


                })
        }
    }
}