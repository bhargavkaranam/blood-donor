'use strict';

var app = angular.module('phive');
app.factory('formateDate', [function () {
    var formate = function (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [month, day, year].join('-');
    }
    return {formate:formate};
}]);