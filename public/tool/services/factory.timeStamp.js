"use strict";

var app = angular.module('phive');

app.factory('timeStamp',['getLocalTime','getJsonData','$q',function(getLocalTime,getJsonData,$q) {
    var diff = function (lastUpdated, jsonKey,hashId) {
        return $q(function (resolve, reject) {
             getLocalTime.get(hashId).then(function(clientTime ){
                 var timeDiff = clientTime - lastUpdated;
            getJsonData.get(jsonKey).then(function (jsonDiff) {
                if (timeDiff <= jsonDiff) {
                    resolve({
                        isValid : true,
                        currentTS : clientTime
                    });
                }
                else {
                   resolve({
                        isValid : false,
                        currentTS : clientTime
                   });
                }
            }).catch(function (err) {
                reject();
            });
             });
        });

    }
   return{
       diff:diff
   }
   
}]);