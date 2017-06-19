"use strict"
var app = angular.module('phive');

app.factory('productId', [function () {
    var id;
    var setProductId = function (id) {
        this.id = id;
    };

    var getproductId = function () {
        return this.id;
    };

    return {
        setProductId: setProductId,
        getproductId: getproductId
    };

}]);
