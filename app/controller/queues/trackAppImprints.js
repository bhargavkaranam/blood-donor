'use strict';

// track the appviews

var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');
var functions = require('../../controller/functions');

var options = require('../../jsonData/queues/trackAppImprints.json');

var trackAppImprints = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('trackAppImprints');
    var dpQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        if (typeof (data) === 'object') {

            var hashId = data.hashId;
            functions.validateHashId(hashId).then(function (validateRes) {

                var userId = data.userId;
                var imprintKey = data.imprintKey;
                var sessionImprintDate = data.sessionImprintDate;
                functions.validateUserId(userId, hashId).then(function (validateUserRes) {
                    if (validateUserRes) {

                        var imprintData = data.imprintData;
                        if (typeof (imprintData) === 'object') {


                            if (typeof (data.sessionImprintDate) === 'string' && data.sessionImprintDate.length) {
                                var installDate = data.sessionImprintDate;
                                var installTimeStamp = imprintData.timeStamp;


                                if (typeof (installTimeStamp) === 'number') {
                                    var updateSessionImprints = new Promise(function (resovle, reject) {

                                        var sessionImprintsObj = {};

                                        var sessionImprintsRef = ref.child('users').child(hashId).child('userInsights').child('user').child('sessionsImprints').child(installDate);
                                        sessionImprintsRef.once('value').then(function (sessionRes) {
                                            var preSessionImprintsObj = sessionRes.val();
                                            if (preSessionImprintsObj.appViews && typeof (preSessionImprintsObj.appViews) === 'number') {
                                                sessionImprintsObj.appViews = preSessionImprintsObj.appViews + 1;
                                                sessionImprintsObj.lastUpdated = installTimeStamp || '';
                                            }
                                            else {
                                                sessionImprintsObj.appViews = 1;
                                                sessionImprintsObj.lastUpdated = installTimeStamp || '';
                                            }
                                            sessionImprintsRef.update(sessionImprintsObj).then(function () {
                                            //    console.log('session Imprints:appViews Updated');
                                                resolve();
                                            }, function (err) {
                                                console.log('session Imprints:appViews Update Failed');
                                                reject(err);
                                            })
                                        }).catch(function (err) {
                                            console.log('session Imprints:appViews Update Failed');
                                            reject(err);
                                        })
                                    });

                                    //
                                    //
                                    //
                                    var updateAppViews = new Promise(function (resolve, reject) {
                                        // hashId/userInsights/user/sessionsImprints/date/installCount
                                        var imprintObj = {};
                                        ref.child('users').child(hashId).child('userInsights').child('user').child('appViews').once('value').then(function (res) {
                                            var resData = res.val();
                                            if (resData && typeof (resData) === 'number') {
                                                imprintObj.appViews = resData + 1;
                                            } else {
                                                imprintObj.appViews = 1;
                                            }
                                            ref.child('users').child(hashId).child('userInsights').child('user').update(imprintObj).then(function (appViewUpdate) {
                                          //      console.log('appViews updated');
                                                resolve();
                                            }, function (err) {
                                                console.log('failed to update appViews ' + err);
                                                reject(err);
                                            });
                                        }).catch(function (err) {
                                            console.log('failed to retrive appViews ' + err);
                                            reject(err);
                                        });

                                    });


                                    Promise.all([updateAppViews, updateSessionImprints]).then(function () {
                                        ref.child('users').child(hashId).child('pwaUsers').child(userId).child('sessionImprints').child(sessionImprintDate).child(imprintKey).update({
                                            isNew: false
                                        }).then(function (res) {
                                                 console.log('isNew updated in appviews');
                                        }, function (err) {
                                            console.log(err);
                                        });
                                        resolve();
                                    }, function (err) {
                                        reject(err);
                                    });
                                } else {
                                    reject('no timeStamp');
                                }

                            }
                            else {
                                reject('invalid data in imprints');
                            }

                        }
                        else {
                            reject('imprintData is invalid');
                        }

                    }
                }, function (validateUserErr) {
                    reject(validateUserErr);
                });
            }).catch(function (err) {
                reject(err);
            });
        }
        else {
            reject('invalid data object');
        }
    })
}

module.exports = trackAppImprints;



