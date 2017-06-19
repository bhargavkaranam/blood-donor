'use strict';

var path = require('path');
var firebase = require('firebase');
var webPush = require('web-push');
var crypto = require('crypto');
var sendMail = require('../controller/sendMail');
var juice = require('juice');
var customPush = require('./customPush');
var userModal = require('./userModal');
var dataPoints = require('./dataPoints');
var functions = require('../controller/functions');
var welcomeNode = require('./welcomePush');
var calculateCost = require('../controller/pricing/calculate-cost');

var rssAttach = require('../controller/rss/check-rss');
var queues = require('../controller/queues');
var ignoreCampaign = [];
var segmentInsights = require('../controller/segmentInsights');
var mailCount = false;

var proxy = require('express-http-proxy');

module.exports = function (app) {
    if (process.env.NODE_ENV == 'production') {
        var address = app.locals.config['HOST'];
    } else if (process.env.NODE_ENV == 'staging') {
     var address = app.locals.config['HOST'];
    } else {
        var address = app.locals.config['HOST'] + app.locals.config['PORT'];
    }

    //json used in handlebar templating
    var jsonDataIndex = {
        env: process.env.NODE_ENV || 'development',
        css: {
            css_DevPath: 'assets/css/prohivecss',
            css_TestPath: 'assets/css/prohivecss',
            css_StagingPath: 'css',
            css_ProductionPath: 'css'
        },
        subScrolling: true,
        navClass: {
            section: 'ph_scroll_tosection',
            redirect: 'ph_redirect_sections'
        },
        href: {
            what: '#What',
            why: '#Why',
            how: '#How',
            main: '#main'
        },
        dataRedirect: {
            what: '#What',
            why: '#Why',
            how: '#How',
            main: '#main'
        },
        dataUrl: '/',
        menu: 'yes',
        address: address

    };

    var jsonDataRest = {
        env: process.env.NODE_ENV || 'development',
        css: {
            css_DevPath: 'assets/css/prohivecss',
            css_TestPath: 'assets/css/prohivecss',
            css_StagingPath: 'css',
            css_ProductionPath: 'css'
        },
        navClass: {
            section: 'ph_scroll_tosection',
            redirect: 'ph_redirect_sections'
        },
        href: {
            what: '/#What',
            why: '/#Why',
            how: '/#How',
            main: '/#main'
        },
        dataRedirect: {
            what: '#What',
            why: '#Why',
            how: '#How',
            main: '#main'
        },
        dataUrl: '/',
        menu: 'yes',
        address: address
    };

    var ref = global.getFirebaseRef.reference;

    // cron jobs - start
    require('../controller/cronJobs/cronJobsInit')(app);
    // cron jobs - end

    // create signup access node -- start
    // var signupAccess = ref.child('users').child('trailLimit').push().update({key :1});
    // create signup access node -- end

    var queueRef;
    var dpQueue;

    (function () {

        // get users HashID on new client addition

        ref.child('users').on('child_added', function (data) {
            var hashId = data.key;
            if (hashId && hashId !== 'clientMapping' && hashId.startsWith('-')) {

                // map user session listners -- start
                userModal.archiveSessions(hashId, app);
                dataPoints.usedDataPoints(hashId);
                // map user session listners -- end

                rssAttach.isRssAttached(hashId)
                // map queues  -- start
                queues.userCountQueue(hashId); // user count queue
                queues.installCountQueue(hashId); // install queue
                queues.spMessageQueue(hashId); // sent messages queue
                queues.trackPushStatsQ(hashId); // trackDelivery , clickDelivery & conversionRate queue
                queues.subscriberQueue(hashId, app); // map subscribers
                queues.trackOfflineImprints(hashId);
                queues.trackAppImprints(hashId);
                queues.trackSubscribers(hashId); // track subscriber in Insights
                queues.redunantSubscriberQ(hashId);
                segmentInsights.updateTotalSegments(hashId);
                queues.totalViewsDP(hashId);
                queues.mauPaymentQueue(hashId, app);
                // map queues - end

                // start -- notification denied module
                //  if (data.child('stats').exists()) {
                // userInsights - child_changed -- start
                ref.child('users').child(hashId).child('stats').on('child_changed', function (deny) {
                    // dataPoints.trackDataPoints(hashId, 1); // send count of Users to datapoints
                    var key = deny.key;
                    if (key && key != 'posts') {
                        updateUserInsights(key, 'child_changed');
                    }
                }, function (error) {
                    console.error("failed user Insights analytics " + error);
                });
                // userInsights - child_changed -- end

                // userInsights -- child_added -- start
                ref.child('users').child(hashId).child('stats').on('child_added', function (deny) {
                    //   dataPoints.trackDataPoints(hashId, 1); // send count of Users to datapoints
                    var key = deny.key;
                    if (key & key != 'posts') {
                        updateUserInsights(key, 'child_added');
                    }
                }, function (error) {
                    console.error("failed user Insights analytics " + error);
                });
                // userInsights -- child_added -- end
                //   } // close of if exists stats
                // end -- notification denied module

                // send push Notification Module

                //   if (data.child('posts').exists()) {
                ref.child('users').child(hashId).child('posts').on('child_added', function (snap1) {

                    var postId = snap1.key;
                    var postData = snap1.val();
                    var isSent = postData.isSent;
                    var testType = postData.testType || '';
                    // check post isSent = false
                    //TODO: add or condition if postId == welcomeMessage to update
                    if (!isSent && typeof (isSent) !== 'undefined' || postId == 'welcomeMessage') {

                        // track tracDelivery & clickDelivery on post - on child_changed
                        ref.child('users').child(hashId).child('stats').child('posts').child(postId).on('child_changed', function (delivery) {

                            var key = delivery.key; // tracDelivery or clickDelivery node name
                            var tasksRef = ref.child('users').child(hashId).child('trackPushStatsQ').child('tasks');
                            tasksRef.push({
                                'key': key,
                                'postId': postId,
                                'type': 'child_changed',
                                'hashId': hashId
                            });
                            queues.trackPushStatsQ(key, postId, 'child_changed', hashId);
                        }, function (error) {
                            console.error("track module " + error);
                        });

                        // track tracDelivery & clickDelivery on post - on child_added
                        ref.child('users').child(hashId).child('stats').child('posts').child(postId).on('child_added', function (delivery) {

                            var key = delivery.key; // tracDelivery or clickDelivery node name
                            var keyVal = delivery.val();
                            // trackPushStats(key, postId, 'child_added');
                            var tasksRef = ref.child('users').child(hashId).child('trackPushStatsQ').child('tasks');
                            tasksRef.push({
                                'key': key,
                                'postId': postId,
                                'type': 'child_added',
                                'hashId': hashId
                            });
                            queues.trackPushStatsQ(key, postId, 'child_added', hashId);
                        }, function (error) {
                            console.error("track module " + error);
                        });

                        if (postId !== 'welcomeMessage') {

                            // update sentPushMessage & viewPostsLimit in campaigns - for campaign & campaign details
                            queues.spMessageQueue(hashId, postData);

                            // update sentPushMessages & viewPostsLimit -- start - sent view in dashboard
                            trackSentPushMessage(hashId);

                            var subArray = [];
                            var groupExist = snap1.child('group').exists();
                            var group = postData.group;
                            var subId;

                            // get fields of newly send post from dashboard
                            var message = postData.content;
                            var title = postData.title;
                            var icon = postData.icon_url;
                            var url = postData.url;

                            //
                            //check if icon exist or not
                            //
                            functions.payloadIcon({ icon: icon, hashId: hashId }, ref).then(function (iconRes) {
                                var payload = {
                                    title: title || '',
                                    message: message || '',
                                    icon: iconRes || '',
                                    tag: postId || '',
                                    url: url || ''
                                };

                                // if group node exists in post

                                if (groupExist) {

                                    // send Push messages to Multi segments -- start
                                    ref.child('users').child(hashId).child('config').once('value').then(function (api) {

                                        var API_KEY = api.val().api_key;

                                        var isLastSegment = false;
                                        for (var i in group) {
                                            if (i == group.length - 1) {
                                                isLastSegment = true;
                                            }

                                            if (group[i].subType == 'all') {
                                                customPush.allUsers(hashId, API_KEY, payload, postId, isLastSegment, testType);

                                            } else {
                                                customPush.chromeSegment(hashId, API_KEY, group[i].subType, group[i].type, payload, postId, isLastSegment, testType, function (res) {
                                                    // temp usage: in case segment selected in Ab testing contains subscriber less than 6, by default : make it to all users
                                                    console.log('res of custom push ' + res);
                                                    if (!res && typeof res !== "undefined") {
                                                        customPush.allUsers(hashId, API_KEY, payload, postId, isLastSegment, testType);
                                                    }
                                                });

                                            }

                                        }
                                    });
                                }
                            }).catch(function (err) {
                                console.log(err);
                            });

                        }
                    } // end of if check isSent
                }, function (error) {
                    console.error(error);
                });
                //  } // end if posts exists
            } // end of if loop clientMapping
            // end - custom push notification

            // Dashboard Analytics
            // onCampaignsCreated module -- start

            ref.child('users').child(hashId).child('templates').on('child_added', function (dat) {

                // update total totalCampaigns - in case of addition
                updateCampaignCount();
            }, function (error) {
                console.log("error in updating userInsights/totalCampaigns " + error);
            });
            // onCampaignsCreated module -- end

            //on campaign deletion module -- start

            ref.child('users').child(hashId).child('templates').on('child_removed', function (dat) {

                // update total totalCampaigns - in case of Deletion
                updateCampaignCount();
            }, function (error) {
                console.log("error in updating userInsights/totalCampaigns " + error);
            });
            //on campaign deletion module -- end

            ref.child('users').child(hashId).child('templates').once('value')
                .then(function (dat) {
                    ignoreCampaign[hashId] = false;
                }, function (error) {
                    console.log("error in updating userInsights/totalCampaigns " + error);
                });



            // update trackInstallation, trackInstallDenied & notificationDenied
            function updateUserInsights(key, type) {
                var insightRef = ref.child('users').child(hashId).child('userInsights');
                insightRef.once('value').then(function (track) {
                    var keyExists = track.child(key).exists();
                    var keyVal = track.child(key).val();
                    //TODO : correct update called with 3 arguments issue
                    // if (type == 'child_added') {
                    //     if (!keyExists || keyVal == 0) {

                    //         // key does not exist update it
                    //         return insightRef.update(functions._defineProperty({}, key, 1), function(success) {}, function(error) {
                    //             if (error) {
                    //                 return 'failed to update ' + key + ' ' + error;
                    //             }
                    //         });
                    //     }
                    // } else {
                    //     if (keyExists && keyVal) {
                    //         return insightRef.update(functions._defineProperty({}, key, keyVal + 1), function(success) {}, function(error) {
                    //             if (error) {
                    //                 return 'failed to update ' + key + ' ' + error;
                    //             }
                    //         });
                    //     }
                    // }
                    return true;

                }).catch(function (err) {
                    console.log('failed updating trackInstallation or trackInstallDenied or notificationDenied ' + err);
                });
            }

            // update Subscriber count
            function updateUserCountForPush() {
                var updatedref = ref.child('users').child(hashId).child('subscriber').once('value').then(function (nodes) {

                    var userCount = nodes.numChildren();
                    console.log("  count " + userCount);
                    var obj = {
                        userCountForPush: userCount
                    };
                    ref.child('users').child(hashId).child('userInsights').update(obj, function (error) {
                        if (error) {
                            console.log("error in updating userCounForPush " + error);
                        }
                    });
                }, function (error) {
                    console.error(error);
                });
            }

            // update campaign count in case of campaign addition nd deletion
            function updateCampaignCount() {
                if (ignoreCampaign.hasOwnProperty(hashId) && !ignoreCampaign.hashId) {
                    return ref.child('users').child(hashId).child('templates').once('value').then(function (temp) {
                        var count = temp.numChildren();
                        return ref.child('users').child(hashId).child('userInsights').child('campaigns').update({
                            totalCampaigns: count,
                            viewCampaignsLimit: 12
                        }).then(function (res) {
                            // datapoint for creating campaign

                            // var tasksRef = ref.child('users').child(hashId).child('dpQueue').child('tasks');
                            // tasksRef.push({
                            //     'weightKey': 'createCampaign',
                            //     'hashId': hashId
                            // });
                            return 'totalCampaigns updated';
                        }, function (err) {
                            console.log('failed to update totalCampaigns ' + err);
                            return 'failed to update totalCampaigns ' + err;
                        });
                    }, function (error) {
                        console.log("temp update error " + error);
                    });
                }
            }

            // update total users for the post
            function updatePostUserCount(snap, postId) {
                var senToTotalUsers = snap.numChildren();
                console.log("sent to toal users " + senToTotalUsers);

                var updateCount = {
                    sentToTotalUsers: senToTotalUsers
                };
                // update sentToTotal Users
                ref.child('users').child(hashId).child('posts').child(postId).update(updateCount, function (error) {

                    if (error) {
                        console.log("error in updating sentToTotalUsers " + error);
                    }
                });
            }
        }, function (errorObject) {

            console.log('error on retrieval hashId ' + errorObject.code);
        });

    })();


    function trackSentPushMessage(hashId) {
        var arr = [];
        ref.child('users').child(hashId).child('posts').once('value').then(function (res) {
            var count = res.numChildren() - 1; // excluding welcome message node
            arr.push(res.val());
            if (count) {
                // update in userInsights/posts/sentPushMessages
                ref.child('users').child(hashId).child('userInsights').child('posts').update({
                    sentPushMessages: count,
                    viewPostsLimit: 10
                }).then(function (sentUpdate) {
                    console.log('updated userInsights/posts/sentPushMessages');
                    //  return 'updated userInsights/posts/sentPushMessages';
                }, function (err) {
                    console.log('error while updating userInsights/posts/sentPushMessages ' + err);
                    // return 'error while updating userInsights/posts/sentPushMessages ' + err;
                });

                if (arr.length == res.numChildren()) {
                    console.log('done');
                }
            }
        });
    };

    // get state of the subscribtionId
    app.post('/getMessage', function (req, res) {

        var subscriptionId = req.body.sub;
        var ref = global.getFirebaseRef.reference;
        // var ref = new Firebase(app.locals.config['FIREBASE_URL'] + 'subscriber/' + subscriptionId);
        ref.child('subscriber').child(subscriptionId).once('value').then(function (snap) {
            var state = snap.val().state;
            console.log("state " + state);
            ref.update({ state: "old" });
            res.json({ state: state });
            res.end();
        }, function (error) {
            // The Promise was rejected.
            console.error(error);
        });
    });

    // Routes for static website start from here


    app.get('/', function (req, res) {
        res.render('index', jsonDataIndex);
    });
    app.get('/features', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('features', jsonDataRest);
    });
    app.get('/know-more', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('knowmore', jsonDataRest);
    });
    app.get('/know-about-aliexpress-pwa', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('aliexpress', jsonDataRest);
    });
    // app.get('/index', function (req, res) {
    //     res.render('index',jsonDataIndex);
    // });
    app.get('/inquire', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('inquire', jsonDataRest);
    });
    app.get('/faqs', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('faqs', jsonDataRest);
    });
    app.get('/pricing', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('pricing', jsonDataRest);
    });
    // app.get('/references', function (req, res) {
    //     jsonDataRest.menu = 'yes';
    //     res.render('references', jsonDataRest);
    // });
    app.get('/about', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('about', jsonDataRest);
    });
    // app.get('/support/', function (req, res) {
    //    jsonDataRest.menu = 'yes';
    //     res.render('support', jsonDataRest);
    // });

    app.get('/privacy-policy', function (req, res) {
        jsonDataRest.menu = 'no';
        res.render('policy/privacy-policy', jsonDataRest);
    });
    app.get('/terms-of-use', function (req, res) {
        jsonDataRest.menu = 'no';
        res.render('policy/terms-of-service', jsonDataRest);
    });
    app.get('/sitemap.xml', function (req, res) {
        // res.set('Content-Type', 'application/xml');
        var options = {
            root: path.join(__dirname, '../views/seo/'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile('sitemap.xml', options, function (err) {
            if (err) {
                next(err);
            } else {
                // console.log('Sent:');
            }
        });
    });
    app.get('/robots.txt', function (req, res, next) {
        res.set('Content-Type', 'text/plain');
        var options = {
            root: path.join(__dirname, '../views/seo/'),
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        res.sendFile('robots.txt', options, function (err) {
            if (err) {
                next(err);
            } else {
                // console.log('Sent:');
            }
        });
    });

    //   app.get('/document',function(req,res){
    //       var data=require('../views/documentation/documentation.json');
    //       var menuData=require('../views/documentation/menu.json');
    //     var localDataRest=jsonDataRest;
    //     localDataRest.layout='documentation';
    //     console.log(menuData);
    //     localDataRest.menuData=menuData;
    //     localDataRest.documentData=data;
    //     res.render('documentation/start',localDataRest);
    //   })


    // app.use('/blog',proxy(app.locals.config['WORDPRESS_URL'], {

    //     proxyReqOptDecorator: function(proxyReqOpts, srcReq) {                   
                          
    //          return proxyReqOpts;
    //     }

        
    // }));

    


    app.get("/support*", function (req, res) {
        // var path = req.params[0] ? req.params[0] : 'index.html';
        // res.sendFile(path, { root: './public/support/' });
        res.render('support', { layout: false, address: address });
    });

    app.get('/error-fetching-push-notifications', function (req, res) {
        jsonDataRest.menu = 'yes';
        res.render('error-fetching-push-notifications', jsonDataRest);
    });
    app.get('/offline', function (req, res) {
        res.render('offline', {
            layout: false,
            env: process.env.NODE_ENV,
            css: {
                css_DevPath: 'assets/css/prohivecss',
                css_TestPath: 'assets/css/prohivecss',
                css_StagingPath: 'css',
                css_ProductionPath: 'css'
            },
            address: address
        });
    });
};