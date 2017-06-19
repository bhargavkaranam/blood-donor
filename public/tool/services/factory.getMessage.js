var app = angular.module('phive');

// return firebase Array
app.factory('getMessage', function ($q, $http) {
    var userMessages = null;

    function LoadData() {
        var defer = $q.defer();
        $http.get('data/message.json').success(function (data) {
            userMessages = data;
            defer.resolve();
        });
        return defer.promise;
    }

    return {
        GetData: function (key) { 
            // return userMessages;
             if (userMessages[key]) {
                return userMessages[key];
            }
         },
        LoadData: LoadData
    }
});