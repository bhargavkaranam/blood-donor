'use strict';


var Queue = require('firebase-queue');
var dataPoints = require('../../routes/dataPoints');
var dataPointsWeight = require('../../jsonData/dataPointWeight.json');
var ref = global.getFirebaseRef.reference;

var firebaseQueue = function (hashId) {
  var queueRef = ref.child('users').child(hashId).child('dpQueue');
  var dpQueue = new Queue(queueRef, function (data, progress, resolve, reject) {
    var weight = data.weightKey;
    if(typeof weight == 'string') {
        weight = dataPointsWeight[data.weightKey];
    } 
    dataPoints.setdataPoints(data.hashId, weight); // TODO : check it should be in promise then resolve
    console.log('data points for :'+ data.weightKey);
    resolve(true);
  });
};

module.exports = firebaseQueue;