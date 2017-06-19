var app = angular.module('phive');

app.factory('updateTemplate', [function () {

    var setTemplate = function (obj) {

        this.obj = obj;
        // this.campaign_title = obj.campaign_title;
        // this.title = obj.title;
        // this.content = obj.content;
        // this.location_url = obj.location_url;
    }
    var getTemplate = function () {

        return this.obj;
    }

    return {
        setTemplate: setTemplate,
        getTemplate: getTemplate
    };

}]);