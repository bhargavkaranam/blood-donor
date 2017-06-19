var app = angular.module('phive');

// Exception handling 
app.factory('$exceptionHandler', ['$log', function ($log) {
    return function myExceptionHandler(exception, cause) {
        //   logErrorsToBackend(exception, cause)
        $log.warn(exception, cause);
    };
}]);