'use strict';

// track offline views

var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');
var functions = require('../../controller/functions');

var options = require('../../jsonData/queues/trackOfflineImprints.json');

var trackOfflineImprints = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('trackOfflineImprints');
    var dpQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        if (typeof (data) === 'object') {

            var hashId = data.hashId;
            var sessionImprintDate = data.sessionImprintDate;
            var imprintKey = data.imprintKey;
            functions.validateHashId(hashId).then(function (validateRes) {

                var userId = data.userId;
                functions.validateUserId(userId, hashId).then(function (validateUserRes) {
                    if (validateUserRes) {

                        var imprintData = data.imprintData;
                        if (typeof (imprintData) === 'object') {


                            if (typeof (data.sessionImprintDate) === 'string' && data.sessionImprintDate.length) {
                                var offlineDate = data.sessionImprintDate;
                                var installTimeStamp = imprintData.timeStamp;
                                // 
                                //
                                //
                                if (typeof (installTimeStamp) === 'number') {
                                    var updateSessionImprints = new Promise(function (resovle, reject) {
                                        var sessionImprintsObj = {};
                                        var sessionImprintsRef = ref.child('users').child(hashId).child('userInsights').child('user').child('sessionsImprints').child(offlineDate);
                                        sessionImprintsRef.once('value').then(function (sessionRes) {
                                            var preSessionImprintsObj = sessionRes.val();
                                            if (preSessionImprintsObj && preSessionImprintsObj.hasOwnProperty('offlineViews') && typeof (preSessionImprintsObj.offlineViews) === 'number') {
                                                sessionImprintsObj.offlineViews = preSessionImprintsObj.offlineViews + 1;
                                                sessionImprintsObj.lastUpdated = installTimeStamp || '';
                                            }
                                            else {
                                                sessionImprintsObj.offlineViews = 1;
                                                sessionImprintsObj.lastUpdated = installTimeStamp || '';
                                            }
                                            sessionImprintsRef.update(sessionImprintsObj).then(function () {
                                             //   console.log('session Imprints:offlineViews Updated');
                                                resolve();
                                            }, function (err) {
                                                console.log('session Imprints:offlineViews Update Failed');
                                                reject(err);
                                            })
                                        }).catch(function (err) {
                                            console.log('session Imprints:offlineViews Update Failed');
                                            reject(err);
                                        })
                                    });

                                    //
                                    //
                                    //
                                    var updateOfflineViews = new Promise(function (resolve, reject) {

                                        var imprintObj = {};
                                        ref.child('users').child(hashId).child('userInsights').child('user').child('offlineViews').once('value').then(function (res) {
                                            var resData = res.val();
                                            if (resData && typeof (resData) === 'number') {
                                                imprintObj.offlineViews = resData + 1;
                                            } else {
                                                imprintObj.offlineViews = 1;
                                            }
                                            ref.child('users').child(hashId).child('userInsights').child('user').update(imprintObj).then(function (appViewUpdate) {
                                           ///     console.log('offlineViews updated');
                                                resolve()
                                            });
                                        }).catch(function (err) {
                                            console.log('failed to retrive offlineViews ' + err);
                                            reject(err);
                                        });

                                    });


                                    Promise.all([updateOfflineViews, updateSessionImprints]).then(function () {
                                        ref.child('users').child(hashId).child('pwaUsers').child(userId).child('sessionImprints').child(sessionImprintDate).child(imprintKey).update({
                                            isNew: false
                                        }).then(function (res) {
                                                 console.log('isNew updated in offline');
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

module.exports = trackOfflineImprints;



