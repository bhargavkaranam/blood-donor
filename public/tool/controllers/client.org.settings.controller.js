angular.module('phive').controller('orgSettingsController', ['$scope', '$state', '$firebaseObject', 'getFirebaseRef', '$uibModal', '$http',
    'getState', 'getMessage', 'filterDate', 'breadCrumb', '$location', 'currentAuth', 'getEmailId', 'findName','$q', orgSettingsController]);

function orgSettingsController($scope, $state,
    $firebaseObject, getFirebaseRef, $uibModal, $http, getState, getMessage, filterDate, breadCrumb, $location, currentAuth, getEmailId, findName, $q) {

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
        var email = getEmailId.getEmail(currentAuth);
        // get hash ID  
        var controllerCode = function (ref, data) {
            var hashId = data.hashId;
            filterDate.show(false);
            $scope.isRequired = false;
            $scope.orgRequired = false;
            $scope.requiredSymbol = "";

            var newPassword;
            $scope.orgSettings = {};
            var company;
            var countryNames = "https://restcountries.eu/rest/v1/all";
            $http({
                method: 'GET',
                url: countryNames
                // transformResponse: undefined
            }).then(function successCallback(response) {
                $scope.orgSettings.countries = response.data;
            }, function errorCallback(response) {
            });

            var displayOrg = $firebaseObject(ref.child('users').child(hashId).child('details'));
            displayOrg.$loaded(
                function (data) {
                    $scope.load = false;
                    $scope.orgSettings.organization = data.companyDetails.name;
                    company = data.companyDetails.name;

                    if (data.billingDetails != undefined) {
                        $scope.orgSettings.billingName = data.billingDetails.billingName;
                        $scope.orgSettings.billingAddress = data.billingDetails.billingAddress;
                        $scope.orgSettings.state = data.billingDetails.state;
                        $scope.orgSettings.zip = data.billingDetails.zip;
                        $scope.orgSettings.country = data.billingDetails.country;
                        $scope.orgSettings.phone = data.billingDetails.phone;
                    }
                    else {
                        var billingDetails = {};
                        billingDetails.billingName = '';
                        billingDetails.billingAddress = '';
                        billingDetails.state = '';
                        billingDetails.zip = '';
                        billingDetails.country = '';
                        billingDetails.phone = '';
                        displayOrg.billingDetails = billingDetails;
                        displayOrg.$save().then(function (data) {
                            console.log("Billing Details Added");
                        })
                    }

                },
                function (error) {
                    console.error("Error:", error);
                }
            );
            $scope.save = function () {
                $scope.load = true;
                var updatedRef = ref.child('users').child(hashId).child('details');
                var obj = $firebaseObject(updatedRef);
                var organization = $scope.orgSettings.organization;
                var billingName = $scope.orgSettings.billingName;
                var billingAddress = $scope.orgSettings.billingAddress;
                var state = $scope.orgSettings.state;
                var zip = $scope.orgSettings.zip;
                var country = $scope.orgSettings.country;
                var phone = $scope.orgSettings.phone;

                if (typeof (organization) !== 'undefined') {
                    $scope.orgRequired = true;
                    obj.$loaded().then(function (data) {
                        obj.companyDetails.name = organization;
                        if (obj.billingDetails == undefined) {
                            obj.billingDetails = {};
                        }
                        //TODO : chk upgraded plan and add billing info.
                        obj.billingDetails.billingName = billingName;
                        obj.billingDetails.billingAddress = billingAddress;
                        obj.billingDetails.state = state;
                        obj.billingDetails.zip = zip;
                        obj.billingDetails.country = country;
                        obj.billingDetails.phone = phone;

                        obj.$save().then(function (ref) {
                            console.log(getMessage.GetData('org_settings_org_success'));
                            $scope.result = true;
                            $scope.orgResult = true;
                            $scope.load = false;
                            $scope.orgMsg = getMessage.GetData('org_settings_org_success');
                            $scope.orgSettings = {};
                        }, function (error) {
                            $scope.load = false;
                            console.log("Error:", error);
                        });
                    }).catch(function (error) {
                        $scope.load = false;
                        $scope.phd_errorMsg = getMessage.GetData('error');
                        $scope.phd_error = true;
                        console.error("Error:", error);
                    });
                }

                $scope.load = false;
            }
            $scope.deactivateAcc = function () {
                $scope.animationsEnabled = true;
                $scope.deactivate = false;
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'views/modals/client.deactivateAcc.modal.html',
                    controller: 'deactivateAcc',
                    backdrop: 'static',

                });
                modalInstance.result.then(function (data) {
                    $scope.deactivate = data;
                    if ($scope.deactivate) {

                        // get name of user
                        var promise = $q(function (resolve, reject) {
                            findName.getName(hashId, currentAuth, 'mktAdmin').then(resolve);
                        }).then(function (username) {

                            var data = {
                                hashId: hashId,
                                email: email,
                                name : username
                            }
                            $http.get('/deactivateUser', {
                                params: data
                            }).then(function (success) {
                                if (success) {
                                    $state.go('deactivatedUser');
                                } else {
                                    $scope.result = true;
                                    $scope.load = false;
                                    $scope.msg = "Unknow err";
                                }
                            }, function (err) {
                                $scope.load = false;
                                $scope.phd_errorMsg = getMessage.GetData('error');
                                $scope.phd_error = true;
                                $scope.result = true;
                                $scope.msg = getMessage.GetData('user_settings_err');
                            })
                        })
                        }
                }, function () {
                        console.log('account deactivation aborted by user');
                    })
            }
        };
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}