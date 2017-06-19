angular.module('phive', ['ui.bootstrap', 'ngAnimate', 'ui.router', 'ngCookies', 'firebase', 'ngResource', 'isteven-multi-select', 'dcbImgFallback', 'chart.js', 'ngMessages','vcRecaptcha','ngclipboard'])
    .value('config', {
        firebase_url: "https://luminous-torch-2375.firebaseio.com/",
        createUrl: function (obj) {
            var path = this.mailPath[obj.path];
            var keys = Object.keys(obj);
            for (var k in keys) {
                var reg = ':' + keys[k];
                path = path.replace(new RegExp(reg, 'gi'), obj[keys[k]]);
            }
            return path;
        },
     mailPath : {
         path : 'users/:hashId/key/:key'
     }
    });