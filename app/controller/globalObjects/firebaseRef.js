'use strict';
var admin = require("firebase-admin");

module.exports = function (app) {
    
    var serviceAccount = require("../../../config/accountKeys/"+ process.env.NODE_ENV +"/serviceAccountKey.json");

    var app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: app.locals.config['DATABASE_URL']
    });

    //    admin.database.enableLogging(true);

    // app for app.FirebaseError
    var obj = {
        reference: app.database().ref(),
        messaging: app.messaging(),
        app: app,
        auth: app.auth(),
        admin: admin
    }

    global.getFirebaseRef = obj;
}
