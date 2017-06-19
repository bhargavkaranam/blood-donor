var app = angular.module('phive');

app.factory('breadCrumb', [function () {
    var headerScope = {};
    var dashBoardScope = {};
    var headerBreadCrumb = false;
    var setDashScope = function ($scope) {
        dashBoardScope = $scope;
    }
    var setScope = function ($scope) {
        headerScope = $scope;
        if (headerBreadCrumb) {
            headerScope.headerBreadCrumb = headerBreadCrumb;
        }
    };
    var setbreadCrumbData = function (breadCrumbData) {
        headerBreadCrumb = {};
        headerBreadCrumb.breadCrumbHeadText = breadCrumbData.breadCrumbHead;
        headerBreadCrumb.bCrumbForFirstElement = breadCrumbData.bCrumblink_first;
        headerBreadCrumb.hrefForFirstElement = breadCrumbData.href_first;
        headerBreadCrumb.bCrumbForSecElement = breadCrumbData.bCrumbForSecElement;;
        headerBreadCrumb.hrefForSecElement = breadCrumbData.hrefForSecElement;
        if (headerScope) {
            headerScope.headerBreadCrumb = headerBreadCrumb;
        }
        if (headerBreadCrumb.bCrumbForFirstElement == 'Campaigns' &&  headerBreadCrumb.bCrumbForSecElement=="") {
            dashBoardScope.classContainer = 'col-xs-12';
        }
        else {
            dashBoardScope.classContainer = 'col-lg-10 col-lg-offset-1';
        }
        if(headerBreadCrumb.breadCrumbHeadText=='Impressions /'){
             dashBoardScope.classContainer = 'col-xs-12';
        }

    }

    return { setScope: setScope, setDashScope: setDashScope, setbreadCrumbData: setbreadCrumbData }
}]);