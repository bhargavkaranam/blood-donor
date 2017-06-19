var app = angular.module('phive');

// return firebase Array
app.factory('getFirebaseRef', ['config',
    function (config) {
        //var ref = new Firebase(config.firebase_url);
        var key = {
            apiKey: "AIzaSyCHqCwanh9Eb5aDwdNz8h8BAXuN40LSiww",
            authDomain: "luminous-torch-2375.firebaseapp.com",
            databaseURL: "https://luminous-torch-2375.firebaseio.com",
            };
    var fb = firebase.initializeApp(key);

    var obj = {
        ref: fb.database().ref(),
        auth: fb.auth()
    };
            
    return obj;
    }
]);