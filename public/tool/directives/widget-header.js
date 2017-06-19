/**
 * Widget Header Directive
 */

angular
    .module('phive')
    .directive('rdWidgetHeader', rdWidgetTitle);

function rdWidgetTitle() {
    var directive = {
        requires: '^rdWidget',
        scope: {
            title: '@',
            icon: '@',
            width: '@',
            content: '@'
        },
        link: function(scope, element, attrs) {
            if (scope.width == undefined) {
                scope.width = 4;
            }
            if(scope.content == undefined){
                scope.content='none';
            }
         },
        transclude: true,
        template: '<div class="widget-header"><div class="row"><div class="pull-left"><i class="fa {{icon}}" ng-class="icon"></i> {{title}} </div><div class="pull-right col-xs-6 col-sm-{{width}}" ng-transclude style="display:{{content}}"></div></div></div>',
        restrict: 'E'
    };
    return directive;
};