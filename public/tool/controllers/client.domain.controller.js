var app = angular.module('phive');
app.controller('domainController', ['$scope', '$location', '$uibModalInstance', '$http', 'data', 'getMessage', 'getToolTip',domainController]);

function domainController($scope, $location, $uibModalInstance, $http, data, getMessage,getToolTip) {
    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.phError = false;
    $scope.domainTip=getToolTip.GetData("domainTip");
    $scope.appSetting={};
    $scope.appSetting.domain={};
    $scope.cancel = function (data) {
        $scope.load = false;
        $uibModalInstance.dismiss();
    };
    $scope.getStarted = function () {
    if($scope.appSetting.domain.modal!=undefined || ""){
        $scope.load = true;
        var obj = {
            url: $scope.appSetting.domain.modal
        }
        $http.post("/retrieveDomainSettings", obj).then(function (result, status) {
            result = result.data;
            if (result.desc) {
                data.manifest.description = result.desc;
            }
            if (result.title) {
                var res = result.title.split(" ");
                data.manifest.name = res[0];
                data.manifest.sort_name = res[0];
            }
            if (result.rootUrl && result.url) {
                var lenOfRootUrl = result.rootUrl.length;
                var lenOfUrl = result.url.length;
                result.url = result.url.substr(lenOfRootUrl, lenOfUrl);
                data.manifest.start_url = result.url;
            }
            if (result.host) {
                data.domain = result.host;
            }
            $scope.cancel(data);
        }, function (err) {
            $scope.load = false;
            $scope.phError = true;
            $scope.errMsg = err.data || getMessage.GetData('domain_err');
        });
    }
    else{
        $scope.load = false;
    }
    };

};


