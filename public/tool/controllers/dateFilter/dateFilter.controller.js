var app = angular.module('phive');
app.controller('dateFilterController', ['$scope', 'filterDate', dateFilterController]);

function dateFilterController($scope, filterDate) {
    $scope.dtmax = new Date();
    $scope.dateformat = 'MM/dd/yyyy';
    $scope.toggleCalendarView = {};
    filterDate.setScope($scope);
    // var dateObj = filterDate.get();
     $scope.fromDate = filterDate.initializeFromDate();
     $scope.toDate = filterDate.initializeToDate();

    $scope.showFromcalendar = function () {
        filterDate.showFromcalendar();
    }
    $scope.showTocalendar = function () {
        filterDate.showTocalendar();
    }
    $scope.set = function (fromDate, toDate) {
        
        filterDate.set(fromDate, toDate,$scope);
    }
    //  $scope.getCampRecords = function (fromDate, toDate) {
    //    filterDate.set(fromDate,toDate)

    //  }
}