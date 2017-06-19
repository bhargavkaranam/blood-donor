"use strict";
var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');

var options = require('../../jsonData/queues/spMessageQueue.json');

var spMessageQueue = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('spMessageQueue');
    var dpQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        // function updateSentPushMessage(hashId, postData) {
        var hashId = data.hashId;
        var postData = data.postData;
        var campaignId = postData.campaignId;
        if (campaignId && campaignId != 0) {
            var templateRef = ref.child('users').child(hashId).child('templates').child(campaignId);
            templateRef.once('value').then(function (temp) {
                var tempData = temp.val();
                if (tempData.sentPushMessages) {
                    var temp = tempData.sentPushMessages + 1;
                    sendupdateSenPushMessage(hashId, temp, campaignId);
                    resolve();
                } else {
                    tempData.sentPushMessages = 1;
                    sendupdateSenPushMessage(hashId, 1, campaignId);
                    resolve();
                }
            }, function (err) {
                console.log('failed to retrieve template data ' + err);
                // return 'failed to retrieve template data ' + err;
                reject();

            });

        }
        resolve();
    });
}

var sendupdateSenPushMessage = function sendupdateSenPushMessage(hashId, count, campaignId) {
    var templateRef = ref.child('users').child(hashId).child('templates').child(campaignId);
    return templateRef.update({
        sentPushMessages: count,
        viewPostsLimit: 10
    }).then(function (res) {
        console.log('sentPushMessages updated Successfully');
        return 'sentPushMessages updated Successfully';
    }, function (err) {
        console.log('failed to update sentPushMessages ' + err);
        return 'failed to update sentPushMessages ' + err;
    });
};
module.exports = spMessageQueue;