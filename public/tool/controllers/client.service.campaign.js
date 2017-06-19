var app = angular.module('phive');

// return firebase Array
app.factory('getFirebaseRef', ['config',

    function (config) {

        // var ref = new Firebase(config.firebase_url);
        // return ref;
        var key = {
                    apiKey: "AIzaSyCHqCwanh9Eb5aDwdNz8h8BAXuN40LSiww",
                    authDomain: "luminous-torch-2375.firebaseapp.com",
                    databaseURL: "https://luminous-torch-2375.firebaseio.com",
                    projectId: "luminous-torch-2375",
                    storageBucket: "luminous-torch-2375.appspot.com",
                    messagingSenderId: "230803098615"
                  };
        var fb = firebase.initializeApp(key);

        var obj = {
                    ref: fb.database().ref(),
                    messaging: fb.messaging(),
                    app: fb,
                    auth: fb.auth(),
                  }        
        return obj;
    }
]);

// app.factory('validateHashId', ['getFirebaseRef', function (getFirebaseRef) {
//     var ref = getFirebaseRef;
//     var hash = {};
//     hash.validate = function (hashId) {
//         if (typeof (hashId) === "string") {
//             var hashExist = ref.child('users').child(hashId).exists();
//             if (hashExist) {
//                 return true;
//             }
//             else {
//                 return false;
//             }
//         }
//         else {
//             return false;
//         }

//     }
//     return hash;
// }]);

app.factory('hash', ['$firebaseArray', 'Auth', 'config', 'getFirebaseRef',
    function ($firebaseArray, Auth, config, getFirebaseRef) {
        var hello = {};
        var auth = Auth;
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
])

// to display templates list
app.factory('productService', ['$firebaseArray', 'Auth', 'getFirebaseRef',

    function ($firebaseArray, Auth, getFirebaseRef) {
        var auth = Auth;
        var uid;
        var model = {};

        model.template = function (hashId) {
            console.log("inside service hash id " + hashId);
            var authData = auth.$getAuth();
            var uid = authData.uid;
            var ref = getFirebaseRef.ref;

            var updatedRef = ref.child('users').child(hashId);
            var arr = $firebaseArray(updatedRef.child('templates'));
            console.log(arr);
            return $firebaseArray(updatedRef.child('templates'));
        }
        return model;
    }
]);

app.factory("Auth", ["$firebaseAuth", 'getFirebaseRef',
    function ($firebaseAuth, getFirebaseRef) {
        var ref = getFirebaseRef.ref;
        var fbAuth = getFirebaseRef.auth;
        return $firebaseAuth(fbAuth);
    }
]);

app.factory('productId', [function () {
    var id;
    var setProductId = function (id) {
        this.id = id;
    };

    var getproductId = function () {
        return this.id;
    };

    return {
        setProductId: setProductId,
        getproductId: getproductId
    };

}]);

// app.factory('hashID', ['$firebaseArray', function($firebaseArray) {
//   var id;
//  var setHashId = function(authData) {

//   var email = authData.email;
//   var key = email.replace(/[.$\[\]\/#]/g, ',');
//   var obj = $firebaseArray(ref.child('users/clientMapping/').child(key));

//   obj.$loaded()
//   .then(function(data) {

//   var hashId = data[0].$value;
//   console.log(" hash "+ hashId);
//    this.id = id;
//  };

//  var getHashId = function() {
//    return this.id;
//  };

//  return{
//    setHashId : setHashId,
//    getHashId :getHashId
//  };

// }]);



app.factory('updateTemplate', [function () {

    var setTemplate = function (obj) {

        this.obj = obj;
        // this.campaign_title = obj.campaign_title;
        // this.title = obj.title;
        // this.content = obj.content;
        // this.location_url = obj.location_url;
    }
    var getTemplate = function () {

        return this.obj;
    }

    return {
        setTemplate: setTemplate,
        getTemplate: getTemplate
    };

}]);

