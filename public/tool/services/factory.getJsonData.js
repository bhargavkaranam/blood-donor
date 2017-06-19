'use strict';
var app = angular.module('phive');
app.factory('getJsonData',['$http','$q',function($http,$q){
    var get = function(key){
            return $q(function (resolve, reject) {
            $http.get('data/segmentImpressionData.json').success(function (data) {
                var userMessages = data;
                if (userMessages[key]) {
                    resolve(userMessages[key]);
                }
                else {
                    reject(false);
                }
            });
        });

    }
    return {
        get:get
    }
}])