var app = angular.module('phive');

app.factory("Auth", ["$firebaseAuth", 'getFirebaseRef',
    function ($firebaseAuth, getFirebaseRef) {
        var ref = getFirebaseRef.auth;
        return $firebaseAuth(ref);
    }
]);
