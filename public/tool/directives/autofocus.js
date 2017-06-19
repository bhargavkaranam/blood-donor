// angular.module('phive').directive('phFocus',function ($timeout) {
angular.module('phive').directive('phFocus', function () {
    return {
        restrict: 'AE',
        scope: {
            trigger: '@phFocus'
        },
        link: function (scope, element) {
            scope.$watch('trigger', function (value) {
                if (value === "true") {
                    //   $timeout(function() {
                    element[0].focus();
                    //   });
                }
            });
        }
    }
});