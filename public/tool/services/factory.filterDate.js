'use strict';
var app = angular.module('phive');

app.factory('filterDate', ['searchResult', 'getMessage', function (searchResult,getMessage) {
    var viewsScope = {};
   
    var initializeFromDate = function () {
            if (window.localStorage) {
                var fromDate = localStorage.getItem('progresshive::filterFromDate');
                if (fromDate && typeof(fromDate) === 'string') {
                     if(typeof(parseInt(fromDate))==='number'){
                         return new Date(parseInt(fromDate));
                    }else{
                      //  console.log('wrong Data in localStorage')
                        return new Date();
                    }
                } else {
                   // console.log('no data (of date) in localStorage');
                    return new Date();
                }
            } else {
                console.log('localStorage not supported');
                return new Date();
            }
        };
        var initializeToDate = function () {
            if (window.localStorage) {
                var toDate = localStorage.getItem('progresshive::filterToDate');
                if (toDate && typeof(toDate) === 'string') {
                    if(typeof(parseInt(toDate))==='number'){
                         return new Date(parseInt(toDate));
                    }else{
                       // console.log('wrong Data in localStorage');
                        return new Date();
                    }
                } else {
                  // console.log('no Date data in localStorage');
                    return new Date();
                }
            } else {
                console.log('localStorage not supported');
                return new Date();
            }
        }
         var date = {
        fromDate: initializeFromDate(),
        toDate:  initializeToDate(),
        scope: ''
    };
    var showTocalendar = function () {
        date.scope.toggleCalendarView.showTodp = true;
    };

    var showFromcalendar = function () {
        date.scope.toggleCalendarView.showFromdp = true;
    };
    var setScope = function ($scope) {
        date.scope = $scope;
       
    };
    var setViewScope = function ($scope) {
        viewsScope = $scope;
    }
    var setLocalStorage = function(fromDate,toDate){
        if(fromDate && toDate && typeof(fromDate)==='object' && typeof(toDate)==='object'){
         if(localStorage){
                    localStorage.setItem('progresshive::filterFromDate',fromDate.getTime());
                    localStorage.setItem('progresshive::filterToDate',toDate.getTime());
                  //  console.log('localStorage filterDate filled');
                }else{
                  //  console.log('loacalStorage not supported');
                    return;
                }
        }else{
           // console.log('invalid data passed');
            return;
        }
    }
    var set = function (fromDate, toDate,$scope) {
        if (typeof (fromDate) !== 'undefined' || typeof (toDate) !== 'undefined') {
            searchResult.remove(viewsScope._hashId).then(function () {
                if (fromDate < toDate) {
                date.fromDate = fromDate;
                date.toDate = toDate;
                setLocalStorage(fromDate,toDate);
                viewsScope.getCampRecords(fromDate, toDate);
                }else{
                    $scope.msg = getMessage.GetData('date_err');
                    $scope.result = true;
                    console.log($scope.msg);
                }
                
            }).catch(function (err) {
                //
                //search result is not deleted what to do
                //
                console.log(err);
            });

        }
    };
    var get = function () {
        return date;
    };
    var show = function (bool,containerClass) {
        date.scope.showCalander = bool;
        date.scope.fromDate = initializeFromDate();
        date.scope.toDate = initializeToDate();
         if(containerClass && typeof(containerClass)==='string' && containerClass.length){
            date.scope.containerClass = containerClass;
        }else{
            date.scope.containerClass = 'col-xs-12 col-md-7' ;
        }
    };
    return {
        set: set,
        get: get,
        show: show,
        setViewScope: setViewScope,
        setScope: setScope,
        setLocalStorage:setLocalStorage,
        initializeFromDate:initializeFromDate,
        initializeToDate:initializeToDate,
        showTocalendar: showTocalendar,
        showFromcalendar: showFromcalendar
    };
}]);