var ref = global.getFirebaseRef.reference;
module.exports = {

    _defineProperty: function (obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
        } else {
            obj[key] = value;
        } return obj;
    },
    validateHashId: function (hashId) {
        if (hashId) {
            return ref.child('users').child(hashId).once('value')
                .then(function (snap) {
                    if (snap.exists())
                        return true
                    else
                        return false
                }, function (err) {
                    console.log('failed to validate hashId ' + err);
                    return false
                })
        } else {
            return false
        }
    },
    validateUserId: function (userId, hashId) {

        return new Promise(function (resolve, reject) {
            if (hashId && userId) {
                ref.child('users').child(hashId).child('pwaUsers').child(userId).once('value', function (snap) {
                    if (snap.exists())
                        resolve(true);
                    else
                        reject('invalid userid');
                }, function (err) {
                    reject(err);
                });
            }
            else {
                reject('invalid parameters');
            }
        })

    },
    generateDateObj: function (startDate, lastDate) {
        return new Promise(function (resolve, reject) {
            var addDays = function (currentDate, days) {
                var dat = new Date(currentDate);
                dat.setDate(dat.getDate() + days);
                return dat.getTime();
            }

            function getDates(startDate, lastDate) {
                var dateObj = {};
                var currentDate = new Date(startDate).getTime();
                while (currentDate <= lastDate) {
                    dateObj[currentDate] = '';
                    currentDate = addDays(currentDate, 1);
                }
                resolve(dateObj);
            };
            if (startDate && lastDate && typeof (startDate) === 'number' && typeof (lastDate) === 'number') {
                getDates(startDate, lastDate);
            } else {
                reject('not a valid timestamp');
            }

        })
    },
    extendObj: function (obj1, obj2) {
        return new Promise(function (resolve, reject) {
            // Variables
            var extend = function () {

                // Variables
                var extended = {};
                var deep = true;
                var i = 0;
                var length = arguments.length;

                // Check if a deep merge
                if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
                    deep = arguments[0];
                    i++;
                }

                // Merge the object into the extended object
                var merge = function (obj) {
                    for (var prop in obj) {
                        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                            // If deep merge and property is an object, merge properties
                            if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                                extended[prop] = extend(true, extended[prop], obj[prop]);
                            } else {
                                extended[prop] = obj[prop];
                            }
                        }
                    }
                };

                // Loop through each object and conduct a merge
                for (; i < length; i++) {
                    var obj = arguments[i];
                    merge(obj);
                }

                return extended;

            }
            resolve(extend(obj1, obj2));
        }
        )
    },

    //
    /* payloadIcon algo
    
    1- check for icon 
        1.1- if exist then retun it

        1.2- if not then retrieve the default icon from the database
            1.2.1- if retrieval is successful
                1.2.1.1- check that the data retrieved is correct and valid
                1.2.1.1.1- if correct then return it
                1.2.1.1.2- else return 'default icon for Widely'
            1.2.2- if retrieval is not successful
                1.2.2.1 if retrieval is not success then return 'default icon for Widely'
        */
    //
    payloadIcon: function (reqObj, ref) {
        return new Promise(function (resolve, reject) {
            if (reqObj && typeof (reqObj) === 'object' && Object.keys(reqObj).length) {
                //reqObj exist and is valid
                var defaultProgresshiveIcon = 'https://www.widely.io/resource/image/addToHome/launcher-icon-4x.png';
                var reqIcon = reqObj.icon;
                var hashId = reqObj.hashId;
                if (reqIcon && typeof (reqIcon) === 'string' && reqIcon.length > 0) {
                    //icon exist and is valid
                    resolve(reqIcon);

                } else {
                    //icon is in valid

                    //
                    //check for hashId
                    //
                    if (hashId && typeof (hashId) === 'string' && hashId.length > 0) {
                        //hashId is valid 

                        //
                        //retrive the data from database
                        //
                        ref.child('users').child(hashId).child('config').child('notificationUrl').once('value', function (iconSnap) {
                            var resIcon = iconSnap.val();
                            if (resIcon && typeof (resIcon) === 'string' && resIcon.length > 0) {
                                //icon retrieved and is valid
                                resolve(resIcon);
                            } else {
                                //TODO: icon not present send Widely icon
                                resolve(defaultProgresshiveIcon);
                            }
                        }).catch(function (err) {
                            // some err during the retrieval
                            resolve(defaultProgresshiveIcon);
                        });
                    } else {
                        //hashId is nivalid
                        // reject('not valid parameters');
                        resolve(defaultProgresshiveIcon);
                    }
                }
            } else {
                //either reqObj does not exist or is invalid
                // reject('not valid parameters');
                resolve(defaultProgresshiveIcon);
            }
        })
    },
    detailObject: function () {
        var det = {
            details: {
                packageDetails: {
                    current: {
                        subscription: 'NA',
                        packageName: 'Beginner',
                        timeOfSubscription: global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP,
                        planId: 101,
                        maxMarketer: 2,
                        maxDeveloper: 1,
                        planDataPoints: 30000,
                        leftConsumption: 30000,
                        consumptionPercent: 0,
                        exceedDp: 0,
                        consumption: 0
                    }

                },
                billingDetails:{
                    billingName:'',
                    billingAddress:'',
                    state:'',
                    zip:'',
                    country:'',
                    phone:'',
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
            }
        };
        return det;
    }
}
