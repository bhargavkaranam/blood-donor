"use strict";

//to update trackdelivery and clickDelivery

var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');
var functions = require('../functions');

var options = require('../../jsonData/queues/trackPushStatsQ.json');

var trackPushStatsQ = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('trackPushStatsQ');
    var dpQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        // function trackPushStats(key, postId, type) {
        var hashId = data.hashId;
        var key = data.key; // trackdelivery or clickDelivery
        var postId = data.postId;
        var type = data.type; // child_added or child_changed
        var updatedRef = ref.child('users').child(hashId).child('posts').child(postId);
        updatedRef.once('value').then(function (snap) {
            var keyExists = snap.child(key).exists();
            var keyVal = snap.child(key).val();

            // datapoints -- start
            if (postId == 'welcomeMessage') {
                // update DP for track delivery of welcome message
                // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                // tasksRef.push({
                //     'weightKey': 'trackDelivery',
                //     'hashId': hashId
                // });
            } else {
                // update DP for track delivery
                // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                // tasksRef.push({
                //     'weightKey': 'trackDelivery',
                //     'hashId': hashId
                // });
            }
            // datapoints -- end 

            if (type == 'child_added') {
                if (!keyExists || keyVal == 0) {

                    // key does not exist update it
                    return updatedRef.update(functions._defineProperty({}, key, 1), function (error) {
                        if (error) {
                            reject(err);
                        } else {
                            calculateConversionRate(key, postId, data.hashId);
                            resolve();
                        }
                    });
                }
            } else {
                if (keyExists && keyVal) {

                    return updatedRef.update(functions._defineProperty({}, key, keyVal + 1), function (error) {
                        if (error) {
                            reject(error);
                        } else {
                            calculateConversionRate(key, postId, data.hashId);
                            resolve();
                        }
                    });
                }
            }
            resolve();
        });
    });
}
function calculateConversionRate(key, postId, hashId) {
    if (key == 'clickDelivery') {

        //get the latest value from post
        ref.child('users').child(hashId).child('posts').child(postId).once('value').then(function (snapshot) {

            var postVal = snapshot.val();
            var clickDelivery = postVal.clickDelivery | 0;
            var totalUsers;
            var obj = {};
            if (postId == 'welcomeMessage') {
                ref.child('users').child(hashId).child('userInsights').child('userCountForPush').once('value').then(function (userCount) {

                    // update DP for click delivery for welcome message
                    // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                    // tasksRef.push({
                    //     'weightKey': 'welcomeClickDelivery',
                    //     'hashId': hashId
                    // });
                    totalUsers = userCount.val();

                    var rate = clickDelivery / totalUsers * 100;
                    if (isFinite(rate)) {
                        obj = {
                            conversionRate: rate
                        };

                        updateConversionRate(postId, obj, hashId);
                    }
                }, function (error) {
                    console.error(error);
                });
            } else {
                // update DP for click delivery
                // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                // tasksRef.push({
                //     'weightKey': 'clickDelivery',
                //     'hashId': hashId
                // });
                totalUsers = postVal.sentToTotalUsers;
                var rate = clickDelivery / totalUsers * 100;
                if (isFinite(rate)) {
                    obj = {
                        conversionRate: rate
                    };

                    updateConversionRate(postId, obj, hashId);
                }
            }
        }, function (error) {
            // The Promise was rejected.
            console.error(error);
        });
    }
}

// update the conversion rate in post
function updateConversionRate(postId, obj, hashId) {

    ref.child('users').child(hashId).child('posts').child(postId).update(obj, function (error) {
        if (error) {
            console.log("error in updating conversion rate " + error);
        }
    });
}


module.exports = trackPushStatsQ;