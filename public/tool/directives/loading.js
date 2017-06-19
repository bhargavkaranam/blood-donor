/**
 * Loading Directive
 * @see http://tobiasahlin.com/spinkit/
 */

angular
    .module('phive')
    .directive('rdLoading', rdLoading);

function rdLoading() {
    var directive = {
        restrict: 'AE',
        template: '<div class="showbox" ng-hide="!load">'+
              '<div class="loader">'+
                '<svg class="circular" viewBox="25 25 50 50">'+
                  '<circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>'+
                '</svg>'+
              '</div>'+
            '</div>'
    };
    return directive;
};