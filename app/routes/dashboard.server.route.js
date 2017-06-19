'use strict';

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
    } else {
        obj[key] = value;
    } return obj;
}

var path = require('path');
var generateMailHbs = require('../controller/generateHbs');
var getUserDetails = require('../controller/getUserDetails');
var dataPoints = require('./dataPoints');
var mail = require(path.resolve(global.getMailPath));
var juice = require('juice');
var functions = require('../controller/functions');
var deactivate = require('../controller/deactivateUser');
var ref = global.getFirebaseRef.reference;
var auth = global.getFirebaseRef.auth;
var planChange = require('../controller/pricing/upgrade-plan');
var nodeErr = require('../controller/pricing/node-error');
var clark = require('../controller/mail/add-to-list');
module.exports = function (app) {

    if (process.env.NODE_ENV == 'production') {
        var address = app.locals.config['HOST'];
    }
    else if (process.env.NODE_ENV == 'staging') {
        var address = app.locals.config['HOST'];
    }
    else {
        var address = app.locals.config['HOST'] + app.locals.config['PORT'];
    }

    app.get('/tool', function (req, res) {
        res.render('tool', { layout: false, env: process.env.NODE_ENV, address: address });
    });

    app.get('/getFileToDownload', function (req, res) {
        // console.log('inside getFileToDownload');
        var data = {
            cacheName: req.query.cacheName,
            firbaseUrl: req.query.firbaseUrl,
            hashId: req.query.hashId,
            defaultIcon: req.query.defaultIcon,
            offlineDependencies: req.query.offlineDependencies || false,
            offlineUrl: req.query.offlineUrl || false,
            singleDependency: req.query.singleDependency || false,
            startUrl: req.query.startUrl
        };
        // console.log('data ' + data);
        var filePath = 'fileDownload/' + req.query.name;
        res.render(filePath, { layout: false, data: data });
    });
    app.post('/mapSiteAdmin', function (req, res) {
        var uid = req.body.uid;
        var provider = req.body.provider;
        var hashId = req.body.hashId;
        var email = req.body.email;
        var role = req.body.role;
        var name = req.body.name;

        // validated hashId
        // check params
        functions.validateHashId(hashId)
            .then(function (isValid) {
                if (isValid) {
                    if (provider && email && role && name && uid) {
                        ref.child('users').child(hashId).child('siteadmin').child(provider).child(uid)
                            .once('value')
                            .then(function (siteSnap) {
                                if (!siteSnap.exists()) {
                                    if (provider && uid && email && name && role) {
                                        var siteObj = {
                                            email: email,
                                            name: name,
                                            role: role
                                        }
                                        ref.child('users').child(hashId).child('siteadmin').child(provider).child(uid)
                                            .update(siteObj)
                                            .then(function (siteRes) {

                                                //  activate user account in case if user first signup via password
                                                var activateUser = {
                                                    clientStatus: true
                                                }
                                                ref.child('users').child(hashId).child('clientUsers')
                                                    .update(activateUser)
                                                    .then(function (activateRes) {
                                                        res.sendStatus(200);
                                                    }, function (err) {
                                                        console.log(err);
                                                        nodeErr.nodeError(hashId, 'failed to activate in mapSiteAdmin', err);
                                                        res.status(500).send(err);
                                                    })
                                            }, function (err) {
                                                console.log(err);
                                                res.status(500).send(err);
                                            })
                                    } else {
                                        res.status(500).send('invalid data');
                                    }
                                } else {
                                    // already in siteadmin
                                    res.sendStatus(200);
                                }
                            }, function (err) {
                                // failed getting siteadmin
                                console.log(err);
                                res.status(500).send(err);
                            })

                    } else {
                        // invalid params null or undefined
                        res.status(500).send('invalid data');
                    }
                }
                else {
                    // invalid hashId
                    res.status(500).send('invalid data');
                }
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).send(err);
            })
    });
    app.get('/getMauPlan', function (req, res) {
        ref.child('users').child('MAUplan').orderByKey()
            .once('value')
            .then(function (init) {
                var initData = init.val();
                if (initData) {
                    res.send(JSON.stringify(initData));
                } else {
                    res.status(500).send('Invalid Data');
                }
            })
            .catch(function (err) {
                res.status(500).send('Invalid Data');
            })
    });
    app.get('/getSubscriberPlan', function (req, res) {
        ref.child('users').child('subscriberPlan').orderByKey()
            .once('value')
            .then(function (init) {
                var initData = init.val();
                if (initData) {
                    res.send(JSON.stringify(initData));
                } else {
                    res.status(500).send('Invalid Data');
                }
            })
            .catch(function (err) {
                res.status(500).send('Invalid Data');
            })
    });
    // create User nodes - Registration
    app.post('/createNode', function (req, res) {
        var email = req.body.email;
        var user_uid;
        var company = req.body.company || "Organization";
        var name = req.body.name;
        var role = req.body.role || 'marketer';
        var hashId = req.body.hashId;
        var invitedUser = req.body.invitedUser;
        var term = req.body.term;
        var provider = 'password';
        var inviteCode = req.body.inviteCode;
        var password = req.body.password;
        var org = req.body.seller;
        var code;
        if (inviteCode && inviteCode.length <= 15) {
            res.status(500).send('invalid_code');
        }
        else if (/^(?=.*[^a-zA-Z])(?=.*[0-9])\S{6,15}$/.test(password)) {
            removeInvite(inviteCode, ref).then(function (removeRes) {
                if (removeRes) {
                    if (term) {
                        auth.createUser({
                            email: email,
                            password: password
                        }).then(function (userData) {
                                console.log("Successfully created user account with uid:", userData.uid);
                                user_uid = userData.uid;
                                if (!invitedUser) {
                                    // add default admin
                                    var client = {
                                        clientUsers: {
                                            clientStatus: false
                                        }
                                    };
                                    var client = {};
                                    client.clientUsers = {};
                                    client.clientUsers.clientStatus = false;

                                    if (org && org.length > 0) {
                                        client.clientUsers.clientStatus = true;
                                    }
                                    ref.child('users').push(client).then(function (data) {
                                        var hashId = data.key;
                                        // console.log("hashId  " + hashId);
                                        var addUserData = {
                                            mktAdmin: _defineProperty({}, user_uid, {
                                                name: name,
                                                email: email
                                            })
                                        };
                                        ref.child('users').child(hashId).child('clientUsers').update(addUserData).then(function (success) {
                                            console.log('user addition successful');
                                            // add mapping of email and hashID
                                            var updatedRef = ref.child('users').child('clientMapping');
                                            var key = email.replace(/[.$\[\]\/#]/g, ',');
                                            if (org && org.length > 0) {
                                                var map = _defineProperty({}, key, {
                                                    hashId: hashId,
                                                    role: 'marketer',
                                                    org: org
                                                });
                                            }
                                            else {
                                                var map = _defineProperty({}, key, {
                                                    hashId: hashId,
                                                    role: 'marketer'
                                                });
                                            }

                                            updatedRef.update(map).then(function (data) {
                                                // console.log("client Mapping done");

                                                // Add default segment All 
                                                ref.child('users').child(hashId).child('segments').push({
                                                    segmentName: 'All',
                                                    subType: 'all',
                                                    type: 'all'
                                                }).then(function (segmentData) {
                                                    // console.log("Default segment created Successfully");
                                                    // res.end();  
                                                    var det = {
                                                        details: {
                                                            packageDetails: {
                                                                current: {
                                                                    subscription: 'NA',
                                                                    timeOfSubscription: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                                                                    timeOfSignUP: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                                                                    maxMarketer: 2,
                                                                    maxDeveloper: 1,
                                                                    planMAU: 50000,
                                                                    planSubscriber: 50000,
                                                                    consumedSubscriber: 0,
                                                                    consumedMAU: 0,
                                                                    discountCode: inviteCode || '',
                                                                    freeTrial: 30,
                                                                    consumedSubscriberPercent: 0,
                                                                    consumedMAUPercent: 0,
                                                                    cost: 0
                                                                }
                                                            },
                                                            billingDetails: {
                                                                billingName: '',
                                                                billingAddress: '',
                                                                state: '',
                                                                zip: '',
                                                                country: '',
                                                                phone: '',
                                                            },
                                                            companyDetails: {
                                                                name: company,
                                                                timeofUserCreation: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP
                                                            },
                                                            termStatus: term
                                                        },
                                                        dataPoints: {
                                                            maxDataPoints: 1000,
                                                            usedDataPoints: 0,
                                                            setDataPoints: 0
                                                        },
                                                        userInsights: {
                                                            user: {
                                                                installCount: 0,
                                                                totalDU: 0,
                                                                totalCampaigns: 0,
                                                                subscribersCount: 0,
                                                                appViews: 0,
                                                                offlineViews: 0
                                                            },
                                                            campaigns: {
                                                                totalCampaigns: 0
                                                            }
                                                        },
                                                        posts: {
                                                            welcomeMessage: {
                                                                clickDelivery: 0,
                                                                icon: "",
                                                                message: "We will keep you posted with ausome stuff!",
                                                                title: "Thanks for Subscribing",
                                                                trackDelivery: 0,
                                                                url: "",
                                                                welcomeFlag: true
                                                            }
                                                        }
                                                    };
                                                    ref.child('users').child(hashId).update(det).then(function (data) {

                                                        if (provider && user_uid && email && name && role) {
                                                            var siteObj = {
                                                                email: email,
                                                                name: name,
                                                                role: role
                                                            }
                                                            ref.child('users').child(hashId).child('siteadmin').child(provider).child(user_uid)
                                                                .update(siteObj)
                                                                .then(function (siteRes) {

                                                                    if (org && org.length > 0) {
                                                                        // seller client 
                                                                        console.log('in seller');
                                                                        res.json({ hashId: hashId });
                                                                        res.end();
                                                                    } else {

                                                                        var hbsData = {
                                                                            email: email,
                                                                            name: name,
                                                                            hashId: hashId,
                                                                            type: 'activateAccount'
                                                                        };
                                                                        var mailHbs = generateMailHbs.hbs(hbsData, app);
                                                                        mailHbs.then(function (resHbsData) {
                                                                            // console.log(resHbsData);
                                                                            if (resHbsData) {
                                                                                var fromEmail = {
                                                                                    email: app.locals.config['MAIL_EMAIL'],
                                                                                    name: app.locals.config['MAIL_NAME'] || 'Widely Support'
                                                                                }
                                                                                var sendMail = mail.send(fromEmail, email, resHbsData, 'Activate Your Account | Widely.IO', app);
                                                                                sendMail.then(function (sentMailres) {

                                                                                    clark.addToList(name, email);
                                                                                    res.json({ hashId: hashId });
                                                                                    res.end();
                                                                                }, function (err) {
                                                                                    console.log('failed to send mail ' + err);
                                                                                    res.status(500).send('mail_failure')
                                                                                });
                                                                            } else {
                                                                                console.log('failed to get hbsData ');
                                                                                res.status(500).send('mail_failure');

                                                                            }
                                                                        }, function (err) {
                                                                            console.log(err);
                                                                            res.status(500).send('mail_failure');
                                                                        });

                                                                    }

                                                                }, function (err) {
                                                                    res.status(500).send(error);
                                                                })
                                                        } else {
                                                            // invalid data
                                                            res.status(500).send('invalid data');
                                                        }

                                                    }, function (error) {
                                                        console.log('err during details addition:' + error);
                                                        res.status(500).send(error);
                                                    });
                                                }, function (error) {
                                                    console.error(' err during Default segment creation ' + error);
                                                    res.status(500).send(error);
                                                });
                                            }, function (err) {
                                                console.log('error during client mapping' + err);
                                                res.status(500).send(err);
                                            });
                                        }, function (err) {
                                            console.log('err during user addition ' + err);
                                            res.status(500).send(err);
                                        });
                                    }).catch(function (err) {
                                        console.log(err);
                                        res.status(500).send(err);
                                    });
                                } else {
                                    if (invitedUser) {
                                        var updatedRef = ref.child('users').child('clientMapping');
                                        var key = email.replace(/[.$\[\]\/#]/g, ',');
                                        var map = _defineProperty({}, key, {
                                            hashId: hashId,
                                            role: role
                                        });
                                        updatedRef.update(map).then(function (data) {
                                            // console.log("All done");
                                            if (role === 'developer') {
                                                var nodeToCreate = 'devAdmin';
                                            }
                                            if (role === 'marketer') {
                                                var nodeToCreate = 'mktAdmin';
                                            }
                                            var updateRef = ref.child('users').child(hashId).child('clientUsers').child(nodeToCreate);
                                            var updateData = _defineProperty({}, user_uid, {
                                                name: name,
                                                email: email
                                            });
                                            updateRef.update(updateData)
                                                .then(function (updateDone) {
                                                    var siteObj = {
                                                        email: email,
                                                        name: name,
                                                        role: role
                                                    }
                                                    ref.child('users').child(hashId).child('siteadmin').child(provider).child(user_uid)
                                                        .update(siteObj)
                                                        .then(function (siteSnap) {
                                                            res.send('success');
                                                        }, function (err) {
                                                            res.status(500).send(err);
                                                        })
                                                });
                                        }, function (err) {
                                            res.status(500).send(err);
                                        });
                                    }
                                } // else end
                        }).catch(function(error) {
                            console.log("Error creating user:", error);
                            res.status(500).send(error.code);
                        });
                    }
                }
                else {
                    res.status(500).send('invalid_code');
                }
            }, function (err) {
                console.log(err);
                res.status(500).send(err.code);
            }).catch(function (err) {
                console.log(err);
                res.status(500).send(err.code);
            })
        } else {
            res.status(500).send('invalid_password');
        }
    });

    //Sign-UP 
    app.post('/signUp', function (req, res) {
        var email = req.body.email;
        var user_uid = req.body.user_uid;
        var name = req.body.name;
        var term = req.body.term;
        var authorized = req.body.authorized;
        var provider = req.body.provider;
        var invitedUser = req.body.invitedUser || false;
        var hashId = req.body.hashId;
        var role = req.body.role;

        if (authorized) {
            if (term) {

                if (!invitedUser) {

                    var client = {
                        clientUsers: {
                            clientStatus: true
                        }
                    };
                    ref.child('users').push(client).then(function (data) {
                        hashId = data.key;
                        // console.log("hashId  " + hashId);
                        var addUserData = {
                            mktAdmin: functions._defineProperty({}, user_uid, {
                                name: name,
                                email: email
                            })
                        };
                        ref.child('users').child(hashId).child('clientUsers').update(addUserData).then(function (success) {
                            // console.log('user addition successful');
                            // add mapping of email and hashID
                            var updatedRef = ref.child('users').child('clientMapping');
                            var key = email.replace(/[.$\[\]\/#]/g, ',');
                            var map = functions._defineProperty({}, key, {
                                hashId: hashId,
                                role: 'marketer'
                            });
                            updatedRef.update(map).then(function (data) {
                                // console.log("client Mapping done");
                                // Add default segment All 
                                ref.child('users').child(hashId).child('segments').push({
                                    segmentName: 'All',
                                    subType: 'all',
                                    type: 'all'
                                }).then(function (segmentData) {
                                    // console.log("Default segment created Successfully");
                                    var det = {
                                        details: {
                                            packageDetails: {
                                                current: {
                                                    subscription: 'NA',
                                                    timeOfSubscription: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                                                    timeOfSignUP: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                                                    maxMarketer: 2,
                                                    maxDeveloper: 1,
                                                    planMAU: 50000,
                                                    planSubscriber: 50000,
                                                    consumedSubscriber: 0,
                                                    consumedMAU: 0,
                                                    freeTrial: 30,
                                                    consumedSubscriberPercent: 0,
                                                    consumedMAUPercent: 0,
                                                    cost: 0
                                                }
                                            },
                                            billingDetails: {
                                                billingName: '',
                                                billingAddress: '',
                                                state: '',
                                                zip: '',
                                                country: '',
                                                phone: '',
                                            },
                                            companyDetails: {
                                                name: 'Organization',
                                                timeofUserCreation: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP
                                            },
                                            termStatus: true
                                        },
                                        dataPoints: {
                                            maxDataPoints: 1000,
                                            usedDataPoints: 0,
                                            setDataPoints: 0
                                        },
                                        userInsights: {
                                            user: {
                                                installCount: 0,
                                                totalDU: 0,
                                                totalCampaigns: 0,
                                                subscribersCount: 0,
                                                appViews: 0,
                                                offlineViews: 0
                                            },
                                            campaigns: {
                                                totalCampaigns: 0
                                            }
                                        },
                                        posts: {
                                            welcomeMessage: {
                                                clickDelivery: 0,
                                                icon: "",
                                                message: "We will keep you posted with ausome stuff!",
                                                title: "Thanks for Subscribing",
                                                trackDelivery: 0,
                                                url: "",
                                                welcomeFlag: true
                                            }
                                        }
                                    };
                                    ref.child('users').child(hashId).update(det).then(function (data) {
                                        // console.log('Details added:');

                                        if (provider && user_uid && email && name) {
                                            var siteObj = {
                                                email: email,
                                                name: name,
                                                role: 'marketer'
                                            }
                                            ref.child('users').child(hashId).child('siteadmin').child(provider).child(user_uid)
                                                .update(siteObj)
                                                .then(function (siteSnap) {
                                                    //TODO: call welcome mail
                                                    var toEmail = {
                                                        primaryMail: email,
                                                        bccEmail: 'hi@widely.io'
                                                    }
                                                    var hbsData = {
                                                        name: name,
                                                        email: toEmail.primaryMail,
                                                        company: 'Organization',
                                                        type: 'welcome'
                                                    };
                                                    var mailHbs = generateMailHbs.hbs(hbsData, app);
                                                    mailHbs.then(function (resHbsData) {
                                                        if (resHbsData) {
                                                            var fromEmail = {
                                                                email: app.locals.config['MAIL_EMAIL'],
                                                                name: app.locals.config['MAIL_EMAIL'] || 'Widely Team'
                                                            }
                                                            var sendMail = mail.send(fromEmail, toEmail, resHbsData, 'Welcome | Widely.IO', app);
                                                            sendMail.then(function (sentMailres) {

                                                                clark.addToList(name, toEmail.primaryMail);
                                                                res.sendStatus(200);
                                                            }, function (err) {
                                                                console.log('failed to send mail ' + err);
                                                                nodeErr.nodeError(hashId, 'failed sending welcome msg', err);
                                                                res.sendStatus(200);
                                                            })
                                                        }
                                                        else {
                                                            console.log('failed to get hbsData ');
                                                            nodeErr.nodeError(hashId, 'failed sending welcome msg', { key: 1 });
                                                        }
                                                    }, function (err) {
                                                        console.log('err generating hbs' + err);
                                                        nodeErr.nodeError(hashId, 'failed generating welcome msg hbsData', err);
                                                        res.sendStatus(200);
                                                    }).catch(function (err) {
                                                        console.log('err generating hbs' + err);
                                                        nodeErr.nodeError(hashId, 'failed generating welcome msg hbsData', err);
                                                        res.sendStatus(200);
                                                    })

                                                }, function (err) {
                                                    console.log(err);
                                                    res.status(500).send('invalid data');
                                                })
                                        } else {
                                            res.status(500).send('invalid data');
                                        }
                                    }, function (error) {
                                        console.log('err during details addition:' + error);
                                        res.status(500).send(error);
                                    });
                                }, function (error) {
                                    console.error(' err during Default segment creation ' + error);
                                    res.status(500).send(error);
                                });
                            }, function (err) {
                                console.log('error during client mapping' + err);
                                res.status(500).send(err);
                            });
                        }, function (err) {
                            console.log('err during user addition ' + err);
                            res.status(500).send(err);
                        });
                    }).catch(function (err) {
                        console.log(err);
                        res.status(500).send(err);
                    });
                } else {
                    if (invitedUser) {
                        var updatedRef = ref.child('users').child('clientMapping');
                        var key = email.replace(/[.$\[\]\/#]/g, ',');
                        var map = _defineProperty({}, key, {
                            hashId: hashId,
                            role: role
                        });
                        updatedRef.update(map).then(function (data) {
                            // console.log("All done");
                            if (role === 'developer') {
                                var nodeToCreate = 'devAdmin';
                            }
                            if (role === 'marketer') {
                                var nodeToCreate = 'mktAdmin';
                            }
                            var updateRef = ref.child('users').child(hashId).child('clientUsers').child(nodeToCreate);
                            var updateData = _defineProperty({}, user_uid, {
                                name: name,
                                email: email
                            });
                            updateRef.update(updateData)
                                .then(function (updateDone) {
                                    var siteObj = {
                                        email: email,
                                        name: name,
                                        role: role
                                    }
                                    ref.child('users').child(hashId).child('siteadmin').child(provider).child(user_uid)
                                        .update(siteObj)
                                        .then(function (siteSnap) {
                                            res.send('success');
                                        }, function (err) {
                                            res.status(500).send(err);
                                        })
                                });
                        }, function (err) {
                            res.status(500).send(err);
                        });
                    }
                }

            } // term end

        }
        else {
            res.status(500).send('register_invalid_password');
        }
    });

    // Authenticate developer - SendAccessToDeveloper- Developer View

    app.post('/authenticateDeveloper', function (req, res) {
        var email = req.body.email;
        var password = req.body.pswd;
        var hashId = req.body.hashId;

        var updatedEmail = email.replace(/[.$\[\]\/#]/g, ',');
        var updatedRef = ref.child('users').child(hashId).child('appSettingsAccess');
        // console.log("inside call");

        var updatedRef = ref.child('users').child(hashId).child('appSettingsAccess');

        updatedRef.once('value').then(function (data) {

            if (data.child(updatedEmail).exists()) {

                var obj = data.val();
                var userPswd = obj[updatedEmail].password;
                if (userPswd == password) {

                    res.send("valid");
                    // success
                } else {
                    res.send("invalid");
                }
            } else {
                res.send("invalid");
            }
        }, function (error) {
            console.error(error);
        });
    });

    // save App settings - AppSettingsView

    app.post('/saveAppSettings', function (req, res) {
        var api_key = req.body.API_KEY;
        var project_no = req.body.project_no;
        // var homeScreenUrl = req.body.homeScreenUrl;
        var notificationUrl = req.body.notificationUrl;
        var hashId = req.body.hashId;
        var domain = req.body.domain;
        var timeZone = req.body.timeZone;
        var obj = {
            api_key: api_key,
            project_no: project_no,
            //  homeScreenUrl : homeScreenUrl,
            domain: domain,
            notificationUrl: notificationUrl,
            hashId: req.body.hashId,
            timeZone: timeZone,
            manifest: req.body.manifest
        };
        var updatedRef = ref.child('users').child(hashId).child('config');

        updatedRef.update(obj).then(function (data) {
            res.send("success");
        }, function (error) {

            res.send("failure");
            console.log("error in saving config " + error);
        });
    });

    // retreive App settings data

    app.post('/getAppSettings', function (req, res) {
        var hashId = req.body.hashId;
        var updatedRef = ref.child('users').child(hashId).child('config');

        updatedRef.once('value').then(function (data) {
            var obj = data.val();
            res.send(JSON.stringify(obj));
        }, function (error) {

            res.send("failure");
            console.log("error in saving config " + error);
        });
    });

    app.get('/validateHashId', function (req, res) {
        var hashId = req.query.hashId;
        if (hashId) {
            ref.child('users').child(hashId).once('value', function (snap) {

                if (snap.exists())
                    res.send(true);
                else
                    res.send(false);
            }, function (err) {
                console.log('failed to validate hashId ' + err);
                res.status(500).send('failed to validate hashId!');
            })
        } else {
            res.status(500).send('failed to validate hashId!');
        }
    });

    app.get('/setAdmin', function (req, res) {
        var email = req.query.email;
        var updatedEmail = email.replace(/[.$\[\]\/#]/g, ',');
        var role = req.query.role;
        var hashId = req.query.hashId;
        var invitation = req.query.invitation;
        //setAdmin
        var updatedRef = ref.child('users').child('invitedUser').child(updatedEmail);
        //
        //set value to update
        var dataToUpdate = {
            hashId: hashId,
            role: role,
            invitation: invitation
        };
        //
        //update the value to firebase
        updatedRef.update(dataToUpdate).then(function (data) {
            if (invitation !== 'rejected') {
                if (invitation === 'accepted') {
                    var mailType = "welcome";
                    var subject = "Welcome  | Widely.IO";
                    var detailTypes = ['company', 'name'];
                    var detailData = {
                        hashId: hashId,
                        email: email
                    }
                }
                if (invitation === 'pending') {
                    var mailType = "invitedUser";
                    var subject = 'Invitation | Widely.IO';
                    var detailTypes = ['company'];
                    var detailData = {
                        hashId: hashId,
                    }
                }
                //get data of the inviter
                getUserDetails.getDetails(detailData, detailTypes).then(function (detailSuccess) {
                    //   console.log(detailSuccess);
                    var hbsData = {
                        name: detailSuccess.name,
                        email: email,
                        hashId: hashId,
                        role: role,
                        company: detailSuccess.company,
                        type: mailType
                    };
                    var mailHbs = generateMailHbs.hbs(hbsData, app);
                    mailHbs.then(function (resHbsData) {
                        // console.log(resHbsData);
                        if (resHbsData) {
                            var fromEmail = {
                                email: app.locals.config['MAIL_EMAIL'],
                                name: app.locals.config['MAIL_NAME'] || 'Widely Support'
                            }
                            var sendMail = mail.send(fromEmail, email, resHbsData, subject, app);
                            sendMail.then(function (sentMailres) {
                                // console.log('mail sent successfully');
                                res.send("success");
                            }, function (err) {
                                console.log('failed to send mail ' + err);
                                res.send("failure");
                            });
                        } else {
                            console.log('failed to get hbsData ');
                            res.send("failure");
                        }
                    }, function (err) {
                        console.log(err);
                        res.send("failure");
                    });
                }, function (detailsError) {
                    console.log('err getting details');
                    console.log(detailsError);
                    res.send("failure");
                });
            }

            res.send("success");
        }, function (error) {
            console.log("error in saving config " + error);
            res.send("failure");
        });

        //TODO: send invite to user  /registerAdmin?hashId =hashId
    });

    app.get('/getAdmin', function (req, res) {
        var hashId = req.query.hashId;
        var email = req.query.email;
        var modifiedMail = email.replace(/[.$\[\]\/#]/g, ',');
        //
        //check the user
        ref.child('users').child('invitedUser').once('value', function (snapshot) {
            var dataExist = snapshot.child(modifiedMail).exists();
            if (dataExist) {

                var invitedData = snapshot.child(modifiedMail).val();
                ref.child('users').child(invitedData.hashId).child('details').child('companyDetails').once('value', function (companySnap) {
                    var companyData = companySnap.val();
                    var resTOSend = {
                        status: true,
                        hashId: invitedData.hashId,
                        role: invitedData.role,
                        company: companyData.name
                    };
                    res.send(resTOSend);
                });
            } else {
                res.send(false);
            }
        });
    });
    app.get('/validateAdm', function (req, res) {
        var uid = req.query.uid;
        ref.child('platformAdmin').once('value', function (uidSnap) {
            var admUid = uidSnap.val().uid;
            if (uid === admUid) {
                res.send(true);
            } else {
                res.send(false);
            }
        }, function (err) {
            console.log(err);
            res.send(false);
        });
    });
    app.get('/deleteInvitedUser', function (req, res) {
        var hashId = req.query.hashId;
        var email = req.query.email;
        var replacedMail = email.replace(/[.$\[\]\/#]/g, ',');
        var onComplete = function onComplete(error) {
            if (error) {
                console.log('invited user deletion failed');
                res.send(false);
            } else {
                // console.log('invited user deletion succeeded');
                res.send(true);
            }
        };
        ref.child('users').child('invitedUser').child(replacedMail).remove(onComplete);
    });

    app.get('/activateUser', function (req, res) {
        var hashId = req.query.hashId;
        var email = req.query.email;
        var alreadyUpdated = false;
        ref.child('users').child(hashId).child('clientUsers').child('clientStatus').once('value', function (checkStatus) {
            var check = checkStatus.val();
            if (!check) {
                var activate = {
                    clientStatus: true
                };
                var updateRef = ref.child('users').child(hashId).child('clientUsers');
                updateRef.update(activate).then(function (success) {
                    var detailTypes = ['company', 'name'];
                    var detailData = {
                        hashId: hashId,
                        email: email
                    }
                    getUserDetails.getDetails(detailData, detailTypes).then(function (detailSuccess) {

                        var hbsData = {
                            name: detailSuccess.name || '',
                            email: email,
                            company: detailSuccess.company || '',
                            type: 'welcome'
                        };
                        var mailHbs = generateMailHbs.hbs(hbsData, app);
                        mailHbs.then(function (resHbsData) {
                            // console.log(resHbsData);
                            if (resHbsData) {
                                var to = {
                                    primaryMail: email,
                                    bccEmail: 'hi@widely.io'
                                }
                                var fromEmail = {
                                    email: app.locals.config['MAIL_EMAIL'],
                                    name: 'Widely Support'
                                }
                                var sendMail = mail.send(fromEmail, to, resHbsData, 'Welcome | Widely.IO', app);
                                sendMail.then(function (sentMailres) {
                                    // console.log('mail sent successfully');
                                    res.send(alreadyUpdated);
                                }, function (err) {
                                    console.log('failed to send mail ' + err);
                                    res.send(err);
                                });
                            } else {
                                console.log('failed to get hbsData ');
                                res.send(err);
                            }
                        }, function (err) {
                            console.log(err);
                            res.send(err);
                        });
                    }, function (detailsError) {
                        console.log('err getting details');
                        console.log(detailsError);
                        res.send("failure");
                    });
                }, function (err) {
                    res.send(err);
                });
            } else {
                alreadyUpdated = true;
                res.send(alreadyUpdated)
            }
        }, function (err) {
            res.send(err);
        });
    });
    app.get('/deactivateUser', function (req, res) {
        var hashId = req.query.hashId;
        var email = req.query.email;
        var name = req.query.name;
        deactivate.deactivateUser(hashId, email, name, app)
            .then(function (snap) {
                if (typeof snap == 'boolean' && snap) {
                    res.send(true);
                } else {
                    // console.log('snap ' + snap);
                    res.send(false);
                }
            }, function (err) {
                console.log(err);
            });
    });

    app.get('/getPlans', function (req, res) {
        ref.child('users').child('plans').once('value', function (plans) {
            var plansData = plans.val();
            var obj = {};
            obj.plans = plansData;
            res.send(obj);
        }, function (err) {
            res.send(err);
        });
    });

    app.get('/applyCost', function (req, res) {
        var hashId = req.query.hashId;
        var email = req.query.email;
        var planMAU = req.query.planMAU;
        var planSubscriber = req.query.planSubscriber;
        // var oldMAU = req.query.oldMAU;
        // var oldSubscriber = req.query.oldSubscriber;
        // var oldCost = req.query.oldCost;
        var cost = req.query.cost;
        var name = req.query.name;

        functions.validateHashId(hashId)
            .then(function (validHash) {
                if (validHash) {
                    if (email && planMAU && planSubscriber && cost) {

                        var updateValue = {
                            cost: cost,
                            planMAU: planMAU,
                            planSubscriber: planSubscriber
                        }
                        ref.child('users').child(hashId).child('details').child('packageDetails').child('current')
                            .update(updateValue)
                            .then(function (updateRes) {
                                // update done

                                // send mail
                                var hbsData = {
                                    email: email,
                                    name: name,
                                    hashId: hashId,
                                    type: 'applyCost',
                                    planMAU: planMAU,
                                    planSubscriber: planSubscriber,
                                    cost: cost
                                };
                                var mailHbs = generateMailHbs.hbs(hbsData, app);
                                mailHbs.then(function (resHbsData) {
                                    // console.log(resHbsData);
                                    if (resHbsData) {
                                        var fromEmail = {
                                            email: app.locals.config['MAIL_EMAIL'],
                                            name: app.locals.config['MAIL_NAME'] || 'Widely Support'
                                        }
                                        var toEmail = {
                                            primaryMail: email,
                                            bccEmail: 'hi@widely.io'
                                        }
                                        var sendMail = mail.send(fromEmail, toEmail, resHbsData, 'Price Update | Widely.IO', app);
                                        sendMail.then(function (sentMailres) {
                                            res.send(true);
                                            res.end();
                                        }, function (err) {
                                            console.log('failed to send mail ' + err);
                                            res.status(500).send('mail_failure');
                                        });
                                    } else {
                                        console.log('failed to get hbsData ');
                                        res.status(500).send('mail_failure');

                                    }
                                }, function (err) {
                                    console.log(err);
                                    res.status(500).send('mail_failure');
                                });
                            }, function (err) {
                                console.log(err);
                                nodeErr.nodeError(hashId, 'failed update package', err);
                                res.status(500).send('Update failed');
                            })
                    } else {
                        // invalid params/values
                        nodeErr.nodeError(hashId, 'invalid params in applyCost', { key: 1 });
                        res.status(500).send('Invalid Params');
                    }
                } else {
                    // invalid hashId
                    nodeErr.nodeError(hashId, 'invalid hashId', { key: 1 });
                    res.status(500).send('Invalid hashId');
                }
            })
            .catch(function (err) {
                console.log(err);
                res.status(500).send('failed');
            })

    })

    app.get('/applyCoupon', function (req, res) {
        var code = req.query.code || 'none';
        var hashId = req.query.hashId;
        functions.validateHashId(hashId)
            .then(function (valid) {
                if (valid) {
                    // hashId validated
                    ref.child('users').child('signupAccess').child(code).once('value')
                        .then(function (accessData) {
                            if (accessData.exists()) {

                                // update in package
                                var discountObj = {
                                    discountCode: code
                                }
                                var getPackage = ref.child('users').child(hashId).child('details').child('packageDetails').child('current');
                                getPackage.update(discountObj)
                                    .then(function (snap) {
                                        res.send(true);
                                        res.end();
                                    }, function (err) {
                                        res.status(500).send(err);
                                        console.log(err);
                                    })
                            }
                            else {
                                // code does not exist
                                res.send(false);
                                res.end();
                            }
                        }, function (err) {
                            console.log(err);
                            res.status(500).send(err);
                        });
                } else {
                    // invalid hashId
                }
            })
            .catch(function (err) {
                console.log(err);
            })

    });

    app.post('/getSegmentImpressions', function (req, res) {
        var hashId = req.body.hashId;
        var currentTS = req.body.currentTS;
        var segmentType = req.body.segmentType;
        var segmentSubType = req.body.segmentSubType;
        var promiseContainer = [];
        var resultObj = {};
        if (typeof (hashId) === 'string' && typeof (currentTS) === 'number' && typeof (segmentSubType) === 'object' && typeof (segmentType)) {
            functions.validateHashId(hashId).then(function (valid) {
                if (valid) {

                    //validate hashId
                    for (var i = 0; i < segmentType.length; i++) {
                        resultObj[segmentType[i]] = {};
                        for (var j = 0; j < segmentSubType[segmentType[i]].length; j++) {
                            var fn = function () {
                                var k = i;
                                var l = j;
                                return new Promise(function (resolve, reject) {
                                    ref.child('users').child(hashId).child('subscriber')
                                        .orderByChild('segments/' + segmentType[k]).equalTo(segmentSubType[segmentType[k]][l]).once('value').then(function (dataSnap) {
                                            // console.log(dataSnap.numChildren());
                                            var subscriberdata = dataSnap.val();
                                            // console.log(k, l);
                                            resultObj[segmentType[k]][segmentSubType[segmentType[k]][l]] = dataSnap.numChildren();
                                            resolve(true);
                                        }).catch(function (err) {
                                            reject(err);
                                        });
                                })
                            };

                            promiseContainer.push(fn());

                        }
                    }

                    var installCount = function () {
                        return new Promise(function (resolve, reject) {

                            ref.child('users').child(hashId).child('userInsights').child('user').child('installCount')
                                .once('value')
                                .then(function (res) {
                                    resultObj.install.true = res.val() || 0;
                                    resolve(true);
                                })
                                .catch(function (err) {
                                    console.log(err);
                                    reject(err);
                                })
                        })
                    }
                    promiseContainer.push(installCount());
                    //TODO: install pending
                    Promise.all(promiseContainer).then(function (value) {
                        if (typeof (resultObj) === 'object' && Array.isArray(Object.keys(resultObj)) && Object.keys(resultObj).length) {
                            // console.log(resultObj, currentTS);
                            resultObj.lastUpdated = currentTS;
                            ref.child('users').child(hashId).child('userInsights').child('segments').set(resultObj)
                                .then(function (segmentUpdated) {
                                    // console.log(segmentUpdated);
                                    res.send(resultObj);
                                }).catch(function (err) {
                                    console.log(err);
                                    res.status(500).send(err);
                                })
                        }

                    }).catch(function (err) {
                        console.log(err);
                    })
                }
            })
        } // end if
    })

    function removeInvite(inviteCode, ref) {
        if (inviteCode) {
            return ref.child('users').child('signupAccess').child(inviteCode).once('value')
                .then(function (accessData) {
                    if (!accessData.exists()) {
                        return false;
                    }
                    var codeData = accessData.val() || {};
                    if (typeof codeData == "object" && codeData.hasOwnProperty('retain')) {
                        // if retain exist skip else remove
                        return true;
                    } else {
                        // remove invite code 
                        ref.child('users').child('signupAccess').child(inviteCode).remove(function () {
                            return true;
                        }, function (error) {
                            console.log('Invite Code deletion failed');
                            return error;
                        });
                    }
                }, function (err) {
                    console.log("Unable to remove invite code details.");
                    return err;
                }).catch(function () {
                    console.log(err);
                    return err;
                });
        } else {
            return new Promise(function (resolve, reject) {
                resolve(true);
            })

        }
    };
};