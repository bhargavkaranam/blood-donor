'use strict';
var ref = global.getFirebaseRef.reference;
var path = require('path');
var Queue = require('firebase-queue');
var functions = require('../../controller/functions');
var upgradeSub = require('../pricing/upgradeSubscriber');
var mail = require(path.resolve(global.getMailPath));
var generateMailHbs = require('../generateHbs');
var calculateCost = require('../pricing/calculate-cost');
var upgradeEmail = require('../pricing/upgrade-email');
var errlog = require('../pricing/node-error');

var options = require('../../jsonData/queues/subscriberPlan.json');

var subscriberQueue = function (hashId, app) {
    var queueRef = ref.child('users').child(hashId).child('subscriberPlanQ');
    var subscriberQ = new Queue(queueRef, options, function (data, progress, resolve, reject) {
        var subscriberCount = data.updatedconsumedSubscriber;
        var hashId = data.hashId;

        ref.child('users').child(hashId).child('details').child('packageDetails').child('current')
            .once('value')
            .then(function (pack) {
                var packageData = pack.val();
                if (packageData && subscriberCount) {
                    var planSubscribers = packageData.planSubscribers || 1000; // default to free package
                    if (planSubscribers < subscriberCount) {
                        // upgrade the subscribers & update
                        upgradeSub.upgradeSubscriber(hashId, planSubscribers, subscriberCount)
                            .then(function (upgradeRes) {
                                if (upgradeRes) {
                                    // calculate cost : consumedMAU , packageData.planSubscriber
                                    calculateCost.getCost(hashId, packageData.planMAU, upgradeRes.planSubscriber)
                                        .then(function (cost) {

                                            // update the values : planSubscriber, consumedSubscriber,new cost , consumedSubscriberPercent
                                            if (typeof cost != "undefined" && !isNaN(cost)) {
                                                var upgradePlan = {
                                                    planSubscriber: upgradeRes.planSubscriber,
                                                    consumedSubscriber: upgradeRes.consumedSubscriber,
                                                    consumedSubscriberPercent: upgradeRes.consumedSubscriberPercent,
                                                    cost: cost
                                                }

                                                ref.child('users').child(hashId).child('details').child('packageDetails').child('current')
                                                    .update(upgradePlan)
                                                    .then(function (up) {

                                                        // get mail of user
                                                        upgradeEmail.getEmail(hashId)
                                                            .then(function (mauEmail) {
                                                                // TODO: mail the customer and bcc: admin
                                                                // send mail to user and bcc admin
                                                                var hbsData = {};
                                                                hbsData.oldSubscriber = planSubscribers;
                                                                hbsData.newSubscriber = upgradeRes.planSubscriber;
                                                                hbsData.cost = cost;
                                                                hbsData.type = "upgradeSubscriber";
                                                                var toEmail = {
                                                                    primaryMail: mauEmail,
                                                                    bccEmail: 'hi@widely.io'
                                                                }
                                                                var mailHbs = generateMailHbs.hbs(hbsData, app);
                                                                mailHbs.then(function (resHbsData) {
                                                                    if (resHbsData) {
                                                                        var fromEmail = {
                                                                            email: app.locals.config['MAIL_EMAIL'],
                                                                            name: app.locals.config['MAIL_NAME'] | 'Widely Team'
                                                                        }
                                                                        var sendMail = mail.send(fromEmail, toEmail, resHbsData, 'Upgrade Subscriber', app);
                                                                        sendMail.then(function (sentMailres) {
                                                                            resolve();
                                                                            console.log('mail sent successfully:' + email);
                                                                        }, function (err) {
                                                                            console.log('failed to send mail ' + err);
                                                                            resolve();
                                                                        })
                                                                    }
                                                                    else {
                                                                        console.log('failed to get hbsData ');
                                                                    }
                                                                }, function (err) {
                                                                    console.log('err generating hbs' + err);
                                                                    reject(err);
                                                                }).catch(function (err) {
                                                                    console.log('err generating hbs' + err);
                                                                    reject(err);
                                                                })

                                                            }, function (err) {
                                                                console.log(err);
                                                                reject(err);
                                                            })

                                                    }, function (err) {
                                                        console.log('failed to upgrade packageDetails');
                                                        errlog.nodeError(hashId, 'failed to upgrade packageDetails', err);
                                                    })
                                            }
                                        })
                                        .catch(function (err) {
                                            console.log(err);
                                        })

                                }
                            })

                    } else {
                        // update in package details
                        // planSubscribers, subscriberCount, consumedSubscriberPercent
                        var consumptionPercent = Math.round(subscriberCount / planSubscribers * 100);
                        var updatedPckg = {
                            planSubscriber: planSubscribers,
                            consumedSubscriber: subscriberCount,
                            consumedSubscriberPercent: consumptionPercent
                        }
                        ref.child('users').child(hashId).child('details').child('packageDetails').child('current')
                            .update(updatedPckg)
                            .then(function (success) {
                                resolve();
                            }, function (err) {
                                console.log('failed to update packageDetails ' + err);
                                reject(err);
                            })
                    }
                } else {
                    // no package 
                    //  console.log('no data in subscriberPlanQ');
                    resolve();
                }
            }).catch(function (err) {
                console.log(err);
            })
    })
}

module.exports = subscriberQueue;