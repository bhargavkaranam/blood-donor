"use strict"

var path = require('path');
var firebase = require('firebase');
var functions = require('../controller/functions');
var ref = global.getFirebaseRef.reference;
module.exports = function(app) {

    // pwa routes
    app.get('/getImprints', function(req, res) {

        var hashId = req.query.hashId;
        var fromDate = parseInt(req.query.fromDate);
        var toDate = parseInt(req.query.toDate);
        var currentTS = parseInt(req.query.currentTS);
        functions.validateHashId(hashId).then(function(validateHashRes) {
            if (typeof (fromDate) === "number" && typeof (toDate) === "number" && typeof (currentTS) === "number") {
                var getDataSnap = function() {
                    return new Promise(function(resolve, reject) {
                        ref.child('users').child(hashId).child('userInsights').child('user').child('sessionsImprints')
                            .orderByChild('lastUpdated')
                            .startAt(fromDate)
                            .endAt(toDate)
                            .once('value')
                            .then(function(snap) {
                                var snapshot = snap.val();
                                if (snapshot) {
                                    // update the data in users/hashId/searchResults/snapshot

                                    // sum total param count
                                    resolve(snapshot);
                                }
                                else {
                                    console.log('no date found');
                                    resolve(false);
                                }
                            })
                            .catch(function(err) {
                                console.log('failed getting imprints');
                                reject('failed getting imprints');
                                // res.status(500).send('failed to fetch results');
                            })
                    })
                }
      
            Promise.all([getDataSnap(), functions.generateDateObj(fromDate, toDate)]).then(function(values) {
                        // console.log(values);
                        functions.extendObj(values[1], values[0]).then(function(extendedData) {
                            console.log(extendedData);
                            var imprintsTotal = sumParams(extendedData);

                            // add current timestamp
                            extendedData.lastUpdated = currentTS;
                            extendedData.total = imprintsTotal;

                            //update the total count 
                        //update the total count 

                        ref.child('users').child(hashId).child('searchResults')
                            .update(extendedData, function(updateRes) {
                                console.log('search done and updated');
                                res.send({
                                    searchObj: extendedData
                                });
                            })
                            .catch(function(err) {
                                console.log('not able to update the data in firebase::' + err);
                                res.send({
                                    searchObj: extendedData
                                });
                            })

                        // res.send(true);
                    }, function(err) {
                        console.log(err);
                        console.log('failed to fetch results');
                        res.status(500).send(err);
                    })

                }).catch(function(err) {
                    console.log(err);
                    res.status(500).send(err);
                });


            }
            else {
                console.log('failed getting imprints');
                res.status(500).send('failed to fetch results');
            }
        }).catch(function(err) {
            res.status(500).send('failed to fetch results');
        });

    });

}

// sum params present in multiple Object
// sum of DuCount,Duvisits etc params in multiple objects for impressions 
function sumParams(snapObj) {
    var temp = {};
    console.log(snapObj);
    var key;
    var dateKeys = Object.keys(snapObj);
    for (var i = 0; i < dateKeys.length; i++) {
        var objKeys = Object.keys(snapObj[dateKeys[i]]);

        //remove lastUpdated
        var index = objKeys.indexOf('lastUpdated');
        objKeys.splice(index, 1);

        for (var j = 0; j < objKeys.length; j++) {

            if (!temp[objKeys[j]]) {
                
                if(typeof snapObj[dateKeys[i]][objKeys[j]] == "object") {
                    key = Object.keys(snapObj[dateKeys[i]][objKeys[j]])[0];
                    temp[objKeys[j]] = {};
                    temp[objKeys[j]][key] = snapObj[dateKeys[i]][objKeys[j]][key];                    
                } else {
                    temp[objKeys[j]] = snapObj[dateKeys[i]][objKeys[j]];
                }
            } else {
                if(typeof(temp[objKeys[j]]) == "object") {
                    key = Object.keys(snapObj[dateKeys[i]][objKeys[j]])[0];
                    temp[objKeys[j]][key] = (temp[objKeys[j]][key] || 0)+ snapObj[dateKeys[i]][objKeys[j]][key];   
                } else {
                 temp[objKeys[j]] = temp[objKeys[j]] + snapObj[dateKeys[i]][objKeys[j]];
                }
            }
        }
    }
    return temp;
}