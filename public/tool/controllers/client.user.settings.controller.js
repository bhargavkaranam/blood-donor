var app = angular.module('phive');
app.controller('userSettingsController', ['$scope',
    '$state', '$firebaseObject', '$uibModal', '$http',
    'getState', 'getMessage', 'filterDate', 'breadCrumb', '$location', 'currentAuth', 'getEmailId', userSettingsController]);

function userSettingsController($scope, $state,
    $firebaseObject, $uibModal, $http, getState, getMessage, filterDate, breadCrumb, $location, currentAuth, getEmailId) {
    $scope.load = true;
    $scope.next = false;
    $scope.next1 = true;

    window.sessionStorage.setItem('currentPage', $location.path());
    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = "";
    breadcrumbData.href_first = "";
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var provider = currentAuth.providerData[0].providerId;
        console.log(provider);
        if(provider === 'google.com'|| provider === 'google'){
            provider = 'google';
        }
        else if(provider === 'github'){
            provider = 'github';
        }
        else{
            provider = 'password';
        }
        var uid = currentAuth.uid;
        var email = getEmailId.getEmail(currentAuth);
        var key = email.replace(/[.$\[\]\/#]/g, ',');
        var clientNode;
        // get hash ID  
        var controllerCode = function (ref, data) {
            var hashId = data.hashId;
            var clientrole = data.role;
            if (clientrole == 'marketer') {
                clientNode = 'mktAdmin';
            } else if (clientrole == 'marketer') {
                clientNode = 'devAdmin';
            }
            filterDate.show(false);
            $scope.isRequired = false;
            $scope.orgRequired = false;
            $scope.requiredSymbol = "";
            var newPassword;
            var displayOrg = $firebaseObject(ref.child('users').child(hashId).child('details'));
            displayOrg.$loaded(
                function (data) {
                    $scope.load = false;
                    $scope.settings = {};
                    $scope.settings.email = email;
                    var siteAdmin = $firebaseObject(ref.child('users').child(hashId).child('siteadmin').child(provider).child(uid));
                    siteAdmin.$loaded(function (data) {
                        var providerName = data.name;
                        if (providerName != undefined) {
                            $scope.settings.userName = providerName
                        }
                        else if (clientNode != undefined) {
                            var clientUser = $firebaseObject(ref.child('users').child(hashId).child('clientUsers').child(clientNode));
                            clientUser.$loaded(function (snapshot) {
                                for (var key in snapshot) {
                                    if (snapshot.hasOwnProperty(key)) {
                                        if (!key.startsWith('$')) {
                                            if (snapshot[key].email == email) {
                                                $scope.settings.userName = snapshot[key].name;
                                                break;
                                            }
                                        }
                                    }
                                };
                            });
                        }
                    });
                },
                function (error) {
                    console.error("Error:", error);
                }
            );

            $scope.onFieldChange = function () {

                // reset password validation                  
                if (typeof ($scope.settings.nPassword) !== 'undefined') {
                    $scope.isRequired = true;
                    $scope.requiredSymbol = "*";
                    newPassword = $scope.settings.nPassword;

                } else {
                    $scope.requiredSymbol = "";
                    $scope.isRequired = false;

                }

            }
            $scope.save = function () {
                $scope.load = true;
                var updatedRef = ref.child('users').child(hashId).child('details');
                var obj = $firebaseObject(updatedRef);
                $scope.settings.email = email;
                var siteAdmin = $firebaseObject(ref.child('users').child(hashId).child('siteadmin').child(provider).child(uid));
                    siteAdmin.$loaded(function (data) {
                        var providerName = data.name;
                        if (providerName != undefined) {
                            data.name=$scope.settings.userName;
                            siteAdmin.$save().then(function (ref) {
                                    console.log(getMessage.GetData('user_settings_org_success'));
                                    $scope.result = true;
                                    $scope.orgResult = true;
                                    $scope.load = false;
                                    $scope.orgMsg = getMessage.GetData('user_settings_org_success');
                                    $scope.settings = {};
                                }, function (error) {
                                    $scope.load = false;
                                    console.log("Error:", error);
                                });
                        }
                        else if (clientNode != undefined) {
                            var clientUser = $firebaseObject(ref.child('users').child(hashId).child('clientUsers').child(clientNode));
                            clientUser.$loaded(function (snapshot) {
                                for (var key in snapshot) {
                                    if (snapshot.hasOwnProperty(key)) {
                                        if (!key.startsWith('$')) {
                                            if (snapshot[key].email == email) {
                                                snapshot[key].name = $scope.settings.userName;
                                                break;
                                            }
                                        }
                                    }
                                };
                                clientUser.$save().then(function (ref) {
                                    console.log(getMessage.GetData('user_settings_org_success'));
                                    $scope.result = true;
                                    $scope.orgResult = true;
                                    $scope.load = false;
                                    $scope.orgMsg = getMessage.GetData('user_settings_org_success');
                                    $scope.settings = {};
                                }, function (error) {
                                    $scope.load = false;
                                    console.log("Error:", error);
                                });
                            });
                        }
                    });
                

                if (typeof ($scope.settings.cPassword) !== 'undefined' && typeof ($scope.settings.nPassword) !== 'undefined' &&
                    typeof ($scope.settings.ccPassword) !== 'undefined') {

                    var currentPassword = $scope.settings.cPassword;
                    $scope.load = true;
                    if (currentPassword === newPassword) {
                        $scope.load = false;
                        $scope.msg = getMessage.GetData('user_settings_same_pass_err');
                        $scope.result = true;
                    } else {
                        // Change  password
                        ref.changePassword({
                            email: email,
                            oldPassword: currentPassword,
                            newPassword: newPassword
                        }, function (error) {
                            if (error) {
                                switch (error.code) {
                                    case "INVALID_PASSWORD":
                                        $scope.load = false;
                                        console.log(getMessage.GetData('user_settings_incorrect_pass_err'));
                                        $scope.result = true;
                                        $scope.msg = getMessage.GetData('user_settings_incorrect_pass_err');
                                        break;
                                    case "INVALID_USER":
                                        $scope.load = false;
                                        console.log(getMessage.GetData('user_settings_user_not_exist_err'));
                                        $scope.result = true;
                                        $scope.msg = getMessage.GetData('user_settings_user_not_exist_err');
                                        break;
                                    default:
                                        $scope.load = false;
                                        console.log("Error changing password:", error);
                                        $scope.result = true;
                                        $scope.msg = getMessage.GetData('user_settings_err');
                                }
                            } else {
                                $scope.load = false;
                                console.log("User password changed successfully!");
                                $scope.result = true;
                                $scope.msg = getMessage.GetData('user_settings_pass_success');
                            }
                        });
                    }
                } // close of if     
                $scope.load = false;

            }

        };
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}