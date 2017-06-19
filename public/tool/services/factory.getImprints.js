'use strict';
var app=angular.module('phive');
app.factory('getImprints',['getLocalTime','$http', function(getLocalTime, $http){
    var getImprint = function(fromDate, toDate, hashId) {
    return getLocalTime.get(hashId).then(function (clientTime) {
        if (clientTime) {
            var paramsData = {
                hashId: hashId,
                fromDate: fromDate,
                toDate: toDate,
                currentTS: clientTime
            }
          return $http.get('/getImprints', { params: paramsData })
             .then(function (getImprintsData) {
               // console.log(getImprintsData);
                return getImprintsData;
             //   $scope.offlineObj.offlineData = getImprintsData.data.searchObj;
                // return {
                //     imprintData : getImprintsData.data.searchObj
                // };
            }, function (err) {
                console.log(err);
                return false;
            })
        }
    }, function (err) {
      //  console.log('failed to get client time ' + err);
        return false;
    })   
    }
    return {
    getImprint : getImprint
}

}])