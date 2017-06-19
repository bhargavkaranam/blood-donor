var app = angular.module('phive');

app.factory('hash', ['$firebaseArray', 'getFirebaseRef',
    function ($firebaseArray, getFirebaseRef) {
        var hello = {};
        hello.getHash = function (email) {

            var ref = getFirebaseRef.ref;
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var obj = $firebaseArray(ref.child('users/clientMapping/').child(key));
            obj.$loaded()
                .then(function (data) {

                    var hashId = data[0].$value;
                    return hashId
                });
        }
        return hello;
    }
]);