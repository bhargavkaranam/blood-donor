// to display templates list
var app = angular.module('phive');

app.factory('productService', ['$firebaseArray', 'Auth', 'getFirebaseRef',

    function ($firebaseArray, Auth, getFirebaseRef) {
        var auth = Auth;
        var uid;
        var model = {};

        model.template = function (hashId) {
           // console.log("inside service hash id " + hashId);
            var authData = auth.$getAuth();
            var uid = authData.uid;
            var ref = getFirebaseRef.ref;

            var updatedRef = ref.child('users').child(hashId);
            var arr = $firebaseArray(updatedRef.child('templates'));
           // console.log(arr);
            return $firebaseArray(updatedRef.child('templates'));
        }
        return model;
    }
]);