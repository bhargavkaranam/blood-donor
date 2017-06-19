"use strict";

var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');

var options = require('../../jsonData/queues/totalViewsDP.json');

var totalViewsDP = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('totalViewsDP');
    var dpQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {

        var hashId = data.hashId;
        ref.child('users').child(hashId).child('userInsights').child('user').child('totalImprints')
        .once('value')
        .then(function(init) {
            var initData = init.val();
            var imprintCount;
            if(initData) {
                imprintCount = initData + 1;
            } else {
                // initData is null
                imprintCount =  1;
            }
            var obj = {
                totalImprints : imprintCount
            }
         ref.child('users').child(hashId).child('userInsights').child('user')
         .update(obj)
         .then(function(res) {
                // update DP for user Subscriber
                // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                // tasksRef.push({
                //     'weightKey': 'creatingSession',
                //     'hashId': hashId
                // });
             resolve();
         }, function(err) {
             console.log(err);
             reject(err);
         })
        })
        .catch(function(err) {
            console.log('failed totalViewsDP '+err);
            reject(err);
        })
    });
}

module.exports = totalViewsDP;