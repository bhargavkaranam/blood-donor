"use strict";
var ref = global.getFirebaseRef.reference;
var path = require('path');
var Queue = require('firebase-queue');
var errlog = require('../pricing/node-error');
var upgrademau = require('../pricing/upgrade-mau');
var mail = require(path.resolve(global.getMailPath));
var generateMailHbs = require('../generateHbs');
var calculateCost = require('../pricing/calculate-cost');
var upgradeEmail = require('../pricing/upgrade-email');

var options = require('../../jsonData/queues/mau-payment.json');

var mauPaymentQueue = function (hashId, app) {
    var queueRef = ref.child('users').child(hashId).child('mauPaymentQ');
    var mauQueue = new Queue(queueRef, options, function (data, progress, resolve, reject) {

       // var consumedMAU = data.consumedMAU;
        var hashId = data.hashId;
        var userType = data.userType;

        ref.child('users').child(hashId).child('details').child('packageDetails').child('current')
            .once('value')
            .then(function (pack) {
                var packageData = pack.val();
                
                if (packageData && userType) {
                    var consumedMAU = packageData.consumedMAU + 1;
                    var planMAU = packageData.planMAU || 1000; // default to free package

                    _getTypeData(hashId, userType)
                        .then(function (typedata) {
                            if (typeof typedata != 'undefined' && consumedMAU) {
                                var updatedMAU = consumedMAU + typedata;
                                if (planMAU < updatedMAU) {
                                    // upgrade the MAU & update
                                    upgrademau.upgradeMAU(hashId, planMAU, consumedMAU)
                                        .then(function (upgradeRes) {
                                            if (upgradeRes) {
                                                // calculate cost : consumedMAU , packageData.planSubscriber
                                                calculateCost.getCost(hashId, upgradeRes.planMAU, packageData.planSubscriber)
                                                    .then(function (cost) {

                                                        // update the values : consumedMAU, planMau,new cost , consumedMAUPercent
                                                        if (typeof cost != "undefined" && !isNaN(cost)) {
                                                            var upgradePlan = {
                                                                planMAU: upgradeRes.planMAU,
                                                                consumedMAU: upgradeRes.consumedMAU,
                                                                consumedMAUPercent: upgradeRes.consumedMAUPercent,
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
                                                                            hbsData.oldMau = planMAU;
                                                                            hbsData.newMau = upgradeRes.planMAU;
                                                                            hbsData.cost = cost;
                                                                            hbsData.type = "upgradeMau";
                                                                            var toEmail = {
                                                                                primaryMail: mauEmail,
                                                                                bccEmail: 'hi@widely.io'
                                                                            }
                                                                            var mailHbs = generateMailHbs.hbs(hbsData, app);
                                                                            mailHbs.then(function (resHbsData) {
                                                                                if (resHbsData) {
                                                                                    var fromEmail = {
                                                                                        email: app.locals.config['MAIL_EMAIL'],
                                                                                        name: app.locals.config['MAIL_NAME'] || 'Widely Team'
                                                                                    }
                                                                                    var sendMail = mail.send(fromEmail, toEmail, resHbsData, 'Upgrade MUV', app);
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
                                        }, function (err) {
                                            console.log(err);
                                            errlog.nodeError(hashId, 'failed to upgradeMAU', err);
                                        })
                                } else {
                                    // update in package details
                                    // consumedMAU, consumedMAUPercent
                                    var consumptionPercent = Math.round(updatedMAU / planMAU * 100);
                                    var updatedPckg = {
                                        consumedMAU: updatedMAU,
                                        planMAU: planMAU,
                                        consumedMAUPercent: consumptionPercent
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
                                resolve();
                            }
                        })
                } else {
                    // no package 
                    //  console.log('no data in MAu payment');
                    resolve();
                }
            }).catch(function (err) {
                console.log(err);
                reject(err);
            })
    });
}
function _getTypeData(hashId, userType) {
    if (userType == 'SU') {
        var userCount = ref.child('users').child(hashId).child('userInsights').child('user');
        return userCount.child('totalDU').once('value').then(function (res) {
            var resData = res.val();
            if (resData) {
                return resData;
            } else {
                return 0;
            }
        })
            .catch(function (err) {
                console.log('failed to get totalSU ' + err);
            })
    } else if (userType == 'DU') {
        var userCount = ref.child('users').child(hashId).child('userInsights').child('user');
        return userCount.child('totalSU').once('value').then(function (res) {
            var resData = res.val();
            if (resData) {
                return resData;
            } else {
                return 0;
            }
        })
            .catch(function (err) {
                console.log('failed to get totalDU ' + err);
            })
    } else {
        return new Promise(function (resolve, reject) {
            resolve(0);
        });
    }
}

module.exports = mauPaymentQueue;