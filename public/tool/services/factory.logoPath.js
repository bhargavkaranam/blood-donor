var app = angular.module('phive');

app.factory('logoPath', ['$firebaseArray', 'getFirebaseRef', '$rootScope',
    function ($firebaseArray, getFirebaseRef, $rootScope) {
        var getLogo = function (org) {
            switch (org) {
                case "SM":
                    $rootScope.reseller = true;
                    return {
                        logo: "assets/img/sm-logo.png",
                        reseller: true
                    }
                case "SR":
                    $rootScope.reseller = true;
                    return {
                        logo: "assets/img/sr-logo.png",
                        reseller: true
                    }
                default:
                    $rootScope.reseller = false;
                    return {
                        logo: "assets/img/logo.png",
                        reseller: false
                    }
            }
        }
        return {
            getLogo: getLogo
        }
    }
]);