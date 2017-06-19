var app = angular.module('phive');
app.controller('accountInfoController', ['$scope', '$state', 'config',
    '$http', '$firebaseObject', 'getFirebaseRef', 'getMessage', 'getState',
    'filterDate', 'breadCrumb', '$location', 'currentAuth', 'getEmailId', accountInfoController]);

function accountInfoController($scope, $state, config, $http,
    $firebaseObject, getFirebaseRef, getMessage, getState, filterDate, breadCrumb, $location, currentAuth, getEmailId) {
    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = '';
    breadcrumbData.href_first = '';
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    var controllerCode = function (ref, data) {
        var hashId = data.hashId;
        filterDate.show(false);
        filterDate.show(false);
        var conf = $firebaseObject(ref.child('users').child(hashId).child('config'));
        conf.$loaded().then(function (data) {
            $scope.data = data;
            $scope.data.hashId = hashId;
            $scope.data.authToken = currentAuth.refreshToken;
            var api_key = data.api_key;
            if (typeof (data.api_key) === 'undefined' || !api_key.length) {
                $scope.appSettingFilled = false;
            } else {
                $scope.appSettingFilled = true;
            }
            $scope.load = false;
            /* var updatedRef = ref.child('users').child(hashId).child('details').child('packageDetails').child('current');
             var obj = $firebaseObject(updatedRef);
             obj.$loaded()
                 .then(function (currentData) {
                     $scope.planData = currentData;
                 }, function (error) {
                     console.log(error);
                 })*/
        }, function (err) {
            $scope.load = false;
            $scope.phd_errorMsg = getMessage.GetData('error');
            $scope.phd_error = true;
            console.log(err);
        })
        $scope.download = function () {
            $scope.load = true;
            console.log('inside download');

            // get data form firebase 
            ref.child('users').child(hashId).child('config').child('manifest').once('value', function (details) {
                var detail = details.val();

                //set data to send in the rest call
                var fileNameManifest = {
                    name: 'manifest.hbs'
                };

                // get the first file from server //rest call
                $http.get('/getFileToDownload', {
                    params: fileNameManifest
                }).then(function (manifest) {

                    //store the received data in local variable
                    var dataManifest = manifest.data;

                    //repalce the component as reaqiured in the file
                    dataManifest.name = detail.name;
                    dataManifest.icons[0].src = detail.default_homeScreenUrl;;
                    dataManifest.short_name = detail.sort_name;
                    dataManifest.background_color = detail.background_color;
                    dataManifest.description = detail.description;
                    dataManifest.display = detail.display;
                    dataManifest.orientation = detail.orientation;
                    dataManifest.start_url = detail.start_url;
                    dataManifest.theme_color = detail.theme_color;
                    dataManifest.gcm_sender_id = $scope.data.project_no;
                    //save first file on the user system 
                    var blob = new Blob([JSON.stringify(dataManifest, null, 2)], {
                        type: 'application/json'
                    });
                    saveAs(blob, "manifest.json");
                }, function (err) {
                    //err getting file form server
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    console.log('not able to get file form server :' + err);
                })
                $scope.load = false; //disable loader
            })
        }
    };
    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}