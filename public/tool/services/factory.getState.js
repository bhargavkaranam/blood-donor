var app = angular.module('phive');

app.factory('getState', function ($q, $http) {
    var states = null;

    function LoadData() {
        var defer = $q.defer();
        $http.get('data/states.json').success(function (data) {
            states = data;
            defer.resolve();
        });
        return defer.promise;
    }

    return {
        GetData: function (key) {
            if (states[key]) {
                return states[key];
            }
        },
        LoadData: LoadData
    }
});