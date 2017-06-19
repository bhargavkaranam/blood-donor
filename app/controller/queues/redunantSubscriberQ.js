'use strict';
var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');

var options = require('../../jsonData/queues/redunantSubscriberQ.json');

var redunantSubscriberQ = function (hashId) {

    var queueRef = ref.child('users').child(hashId).child('redunantSubscriberQ');
    var queue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        var error = data.error;
        var errBody = error.body;
        var hashId = data.hashId;
        if (errBody) {
            if (errBody.includes('NotRegistered')) {
                var endpointSections = error.endpoint.split('/');
                var subscriptionId = endpointSections[endpointSections.length - 1];

                var subscriptionRemoveRef = ref.child('users').child(hashId).child('subscriber').child(subscriptionId);
                
                var subscriptionRef = ref.child('users').child(hashId).child('subscriber').child(subscriptionId).child('subscription');
                subscriptionRef.once("value").then(function (snapshot) {
                    var errorStat = snapshot.child("errorStatus").exists();
                    if (errorStat) {
                        if (subscriptionRemoveRef.remove(removeSubscriberId)) {
                            resolve();
                        } else {
                            reject();
                        }
                    } else {
                        subscriptionRef
                            .update({ errorStatus: 'critical' })
                            .then(function (res) {
                                resolve();
                            })
                            .catch(function (err) {
                                reject(err);
                            })
                    }
                }, function (err) {
                    console.log(err);
                     reject(err);
                });
            }
            else {
                // no error 'NotRegistered' type
                resolve();
            }
        } else {
            // error: undefined
            resolve();       
        }
    });

};

function removeSubscriberId(error) {
    if (error) {
        console.log('subscriptionId deletion failed');
        return false;
    } else {
        return true;
    }
}
module.exports = redunantSubscriberQ;