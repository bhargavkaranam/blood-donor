'use strict';
var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');
var functions = require('../../controller/functions');

var options = require('../../jsonData/queues/installCountQueue.json');

var installCountQueue = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('installCountQueue');
    var dpQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {

        if (typeof (data) === 'object') {
            var hashId = data.hashId;
            functions.validateHashId(hashId).then(function (validateRes) {

                // hashId validated

                var userId = data.userId;
                functions.validateUserId(userId, hashId).then(function (validateUserRes) {
                    if (validateUserRes) {
                        
                        var installCountData = data.installCountData;
                        if(typeof(installCountData)==='object'){

                        var isInstall = installCountData.isInstall;
                        var installDateKeys = Object.keys(installCountData.imprint);
                        if(Array.isArray(installDateKeys) && installDateKeys.length >0)
                        {
                         var installDate = installDateKeys[0]; 
                        var installTimeStamp = installCountData.imprint[installDate].timeStamp;
                        // 
                        //
                        //
                        if(installTimeStamp){
                            var updateInstallCount = new Promise(function (resolve, reject) {
                            if (isInstall && typeof isInstall != 'undefined') {
                                var installCountObj = {};
                                ref.child('users').child(hashId).child('userInsights').child('user').child('installCount').once('value').then(function (installRes) {
                                    var prevInstallCount = installRes.val();
                                    if (prevInstallCount) {
                                        installCountObj.installCount = prevInstallCount + 1;
                                    } else {
                                        installCountObj.installCount = 1;
                                    }
                                    ref.child('users').child(hashId).child('userInsights').child('user').update(installCountObj).then(function (installSuccess) {
                                        console.log('installcount Updated');
                                        resolve();
                                    }, function (err) {
                                        console.log('failed to update install count ' + err);
                                        reject(err);
                                    });
                                }).catch(function (err) {
                                    console.log('failed to retrive installCount ' + err);
                                    reject(err);
                                });
                            }
                            else
                               resolve();         // reject('isInstall is not true');
                        });

                        // update installCount as per date 
                        //
                        //
                        var updateSessionImprints = new Promise(function (resolve, reject) {
                            // hashId/userInsights/user/sessionsImprints/date/installCount
                            var sessionImprintsObj = {};
                            var sessionImprintsRef = ref.child('users').child(hashId).child('userInsights').child('user').child('sessionsImprints').child(installDate);
                            sessionImprintsRef.once('value').then(function (sessionRes) {
                                var preSessionImprintsObj = sessionRes.val();
                                if (preSessionImprintsObj && preSessionImprintsObj.hasOwnProperty('installCount')) {
                                    sessionImprintsObj.installCount = preSessionImprintsObj.installCount + 1;
                                    sessionImprintsObj.lastUpdated = installTimeStamp || '';
                                }
                                else {
                                    sessionImprintsObj.installCount = 1;
                                    sessionImprintsObj.lastUpdated = installTimeStamp || '';
                                }
                                sessionImprintsRef.update(sessionImprintsObj).then(function () {
                                    console.log('session Imprints:installCount Updated');
                                    resolve();
                                }, function (err) {
                                    console.log('session Imprints:installCount Update Failed '+ err);
                                    reject(err);
                                })
                            }).catch(function (err) {
                                console.log('session Imprints:installCount Update Failed '+ err);
                                reject(err);
                            })

                        });


                        Promise.all([updateInstallCount, updateSessionImprints]).then(function () {

                            resolve();
                        }, function (err) {
                            reject(err);
                        });
                        }else{
                            reject('no timeStamp');
                        }

                        }
                        else{
                            reject('invalid data in imprints');
                        }

                        }
                        else
                        {
                            reject('installCountData is invalid');
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



    });
}

module.exports = installCountQueue;