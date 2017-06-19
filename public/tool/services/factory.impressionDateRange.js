"use strict"
var app = angular.module('phive');

app.factory('dateRange', [function () {
    // get the range of date length
    var getSpaceLimit = function(dataLen) {
        var dateList = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360];
        var spaceLimit = [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
        var dateLen = dateList.length;

        for (var k = 0; k < dateLen; k++) {
            if (dataLen < dateList[k]) {
                return spaceLimit[k];
            }
        }
    }
    return {
        getSpaceLimit : getSpaceLimit
    }

}]);


