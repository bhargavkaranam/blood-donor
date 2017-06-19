"use strict";

var app = angular.module('phive');
app.factory('getLocalTime',['$http','getFirebaseRef','getCookie','$q',function($http,getFirebaseRef,getCookie,$q){
    var ref = getFirebaseRef.ref;
    var get = function(hashId){
        return $q(function(resolve,reject){
        var d = new Date();
        var localTime = d.getTime();
        var localOffset = d.getTimezoneOffset() * 60000;
        var utc = localTime + localOffset;
        var clientOffset = getCookie.get('progresshive::time');
        if (clientOffset === "undefined" || clientOffset.length === 0) {
                var offsetRef = ref.child('users').child(hashId).child('pwaMappings').child('clientTimeZone');
                offsetRef.once('value',function(clientOffsetSpan){
                    clientOffset = clientOffsetSpan.val();
                    if(typeof(clientOffset)==='number'){
                        resolve (utc +(clientOffset * 3600000));
                    }
                    else{
                        resolve( utc +(5.5 * 3600000));
                    }
                })
            }
            else{
                resolve(utc + (clientOffset * 3600000));
            }
        })
    };
    return{
        get:get
    }
}]);