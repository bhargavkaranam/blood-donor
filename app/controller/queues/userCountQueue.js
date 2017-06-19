"use strict";

var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');

var options = require('../../jsonData/queues/userCountQueue.json');

var userCountQueue = function(hashId) {
    var queueRef = ref.child('users').child(hashId).child('userCountQueue');
var queue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
    var userId = data.userId;
    var hashId = data.hashId;
    function updateUserCount(userId, hashId) {
    if (userId.includes('du_')) {
        var userCount = ref.child('users').child(hashId).child('userInsights').child('user');
        userCount.child('totalDU').once('value').then(function (res) {
            var resData = res.val();
            if (resData) {
                var count = resData + 1;
                userCount.update({ totalDU: count }).then(function (userCnt) {

                    //dynamic user MAU payment
                    var tasksRef = ref.child('users').child(hashId).child('mauPaymentQ').child('tasks');
                    tasksRef.push({
                        'consumedMAU': count,
                        'hashId': hashId,
                        'userType' : 'DU'
                    });
                    console.log('user count updated successfully for dynamic user ' + hashId);
                    resolve();
                }, function (err) {
                    console.log('user count failed to update ' + err);
                    reject(err);
                });
            } else {
                userCount.update({ totalDU: 1 }).then(function (userCnt) {

                    //dynamic user MAU payment
                    var tasksRef = ref.child('users').child(hashId).child('mauPaymentQ').child('tasks');
                    tasksRef.push({
                        'consumedMAU': 1,
                        'hashId': hashId,
                        'userType' : 'DU'
                    });
                    console.log('user updated successfully');
                    resolve();
                }, function (err) {
                    console.log('user count failed to update ' + err);
                    reject(err);
                });
            }
        });
    } else if (userId.includes('su_')) {
        var userCount = ref.child('users').child(hashId).child('userInsights').child('user');
        userCount.child('totalSU').once('value').then(function (res) {
            var resData = res.val();
            if (resData) {
                var count = resData + 1;
                userCount.update({ totalSU: count }).then(function (userCnt) {

                    //Signed user MAU payment
                    var tasksRef = ref.child('users').child(hashId).child('mauPaymentQ').child('tasks');
                    tasksRef.push({
                        'consumedMAU': count,
                        'hashId': hashId,
                        'userType' : 'SU'
                    });

                    console.log('user count updated successfully for signedIn user ');
                    resolve();
                }, function (err) {
                    console.log('user count failed to update ' + err);
                    reject(err);
                });
            } else {
                userCount.update({ totalSU: 1 }).then(function (userCnt) {

                    //Signed user MAU payment
                    var tasksRef = ref.child('users').child(hashId).child('mauPaymentQ').child('tasks');
                    tasksRef.push({
                        'consumedMAU': 1,
                        'hashId': hashId,
                        'userType' : 'SU'
                    });

                    console.log('user updated successfully');
                    resolve();
                }, function (err) {
                    console.log('user count failed to update ' + err);
                    reject(err);
                });
            }
        });
    }
}
});
}

module.exports = userCountQueue;