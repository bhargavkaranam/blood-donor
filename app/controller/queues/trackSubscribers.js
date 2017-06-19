"use strict";
//to update browser, device, locale, os and view of subscriber

var ref = global.getFirebaseRef.reference;
var Queue = require('firebase-queue');
var functions = require('../functions');

var options = require('../../jsonData/queues/trackSubscribers.json');

var trackSubscribers = function (hashId) {
    var queueRef = ref.child('users').child(hashId).child('trackSubscribers');
    var subscriberQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        var hashId = data.hashId;
        var userSubscriberData = data.subscriberData;

        // get imprint
        if (userSubscriberData.hasOwnProperty('imprint')) {
            var imprintObj = userSubscriberData.imprint;
            var imprintKeys = Object.keys(imprintObj);
            var TS = imprintKeys[0]; // date in TS format with setHours(0,0,0,0)
            if (TS) {
                var oldData = ref.child('users').child(hashId).child('userInsights').child('user').child('sessionsImprints').child(TS)
                    .once('value')
                    .then(function (res) {
                        var newInsightsObj = {};
                        var oldUserInsightsObj = res.val() || {};

                        // check and update subscribersCount -- start
                        if (oldUserInsightsObj.hasOwnProperty('subscribersCount')) {
                            newInsightsObj.subscribersCount = oldUserInsightsObj.subscribersCount + 1;
                        } else {
                            newInsightsObj.subscribersCount = 1;
                        }                   

                        // check and update subscribersCount -- end 
                        
                        // view handling for standalone/browser -- start
                        if (imprintObj[TS].hasOwnProperty('view')) {
                            // view exists in new Subscriber
                            // check for view standalone/browser present in insights
                            if (oldUserInsightsObj.hasOwnProperty('view')) {
                                // add view sum
                                var viewType = imprintObj[TS].view;
                                if (oldUserInsightsObj.view.hasOwnProperty(viewType)) {
                                    newInsightsObj.view = {};
                                    newInsightsObj.view[viewType] = oldUserInsightsObj.view[viewType] + 1;
                                } else {
                                    newInsightsObj.view = {};
                                    newInsightsObj.view[viewType] = 1;
                                }
                            } else {
                                // create view
                                var viewType = imprintObj[TS].view;
                                newInsightsObj.view = {};
                                newInsightsObj.view[viewType] = 1;
                            }
                        }
                        // view handling for standalone/browser -- end

                        // get segments 
                        if (userSubscriberData.hasOwnProperty('segments')) {
                            var segmentObj = userSubscriberData.segments;
                            var segmentKeys = Object.keys(segmentObj);

                            for (var i = 0; i < segmentKeys.length; i++) {

                                // check browser key 
                                if (segmentObj.hasOwnProperty(segmentKeys[i])) {
                                    // browser exists in new Subscriber data
                                    // check for browser chrome/firefox.. present in insights
                                    if (oldUserInsightsObj.hasOwnProperty(segmentKeys[i])) {
                                        // add view sum
                                        var segType = segmentObj[segmentKeys[i]] || 'unknown';
                                        if (oldUserInsightsObj[segmentKeys[i]].hasOwnProperty(segType)) {
                                            newInsightsObj[segmentKeys[i]] = {};
                                            newInsightsObj[segmentKeys[i]][segType] = oldUserInsightsObj[segmentKeys[i]][segType] + 1;
                                        } else {
                                            newInsightsObj[segmentKeys[i]] = {};
                                            newInsightsObj[segmentKeys[i]][segType] = 1;
                                        }
                                    } else {
                                        // create view
                                        var segType = segmentObj[segmentKeys[i]] || 'unknown';
                                        newInsightsObj[segmentKeys[i]] = {};
                                        newInsightsObj[segmentKeys[i]][segType] = 1;
                                    }
                                }
                                // check - end

                            } // for - end
                        } // segments - end

                        ref.child('users').child(hashId).child('userInsights').child('user').child('sessionsImprints').child(TS)
                            .update(newInsightsObj)
                            .then(function () {
                                console.log(' updated insights ');

                                // update DP for user Subscriber
                                // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                                // tasksRef.push({
                                //     'weightKey': 'subscriberCount',
                                //     'hashId': hashId
                                // });
                                resolve();
                            }, function (err) {
                                console.log('failed on err ' + err);
                                reject();
                            })

                    })
                    .catch(function (err) {
                        console.log(err);
                    })
            }
        }
    });
}

module.exports = trackSubscribers;