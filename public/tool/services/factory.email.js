angular.module('phive').factory('getEmailId', ['getFirebaseRef', '$firebaseObject', '$state', '$location', 'getMessage', '$http', '$uibModal','logoPath',
    function (getFirebaseRef, $firebaseObject, $state, $location, getMessage, $http, $uibModal,logoPath) {
        var ref = getFirebaseRef.ref;
        var getEmail = function (currentAuth, controllerCode) {
            var email;
            if (currentAuth.email != undefined) {
                email = currentAuth.email;
            }
            else if (currentAuth.providerData[0].providerId === "google.com") {
                email = currentAuth.providerData[0].email;
            }
            else if (currentAuth.providerData[0].providerId === "github") {
                email = currentAuth.providerData[0].email;
            }
            return email;

        };
        var checkClientStatus = function (email, controllerCode, $scope) {
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var obj = $firebaseObject(ref.child('users/clientMapping/').child(key));
            obj.$loaded()
                .then(function (data) {
                    // seller logo binding for client
                    if (data.org) {
                      $scope.logo =   logoPath.getLogo(data.org).logo;
                        // if (data.org == 'SM') {
                        //     $scope.logo = "assets/img/sm-logo.png";
                        // } else if (data.org == 'SR') {
                        //     $scope.logo = "assets/img/sr-logo.png";
                        // } else {
                        //     $scope.logo = "assets/img/logo.png";
                        // }
                    } else {
                        $scope.logo = "assets/img/logo.png";
                    }

                    // check seller login
                    if (data.seller) {
                        $state.go('admin');
                    }

                    var getClientStatus = $firebaseObject(ref.child('users').child(data.hashId).child('clientUsers').child('clientStatus'));
                    getClientStatus.$loaded(function (clientStatusData) {
                        var clientStatus = clientStatusData.$value || false;
                        if (clientStatus) {
                            controllerCode(
                                ref, data);
                        }
                        else {
                            $state.go('deactivatedUser');
                        }
                    })
                        .catch(function (error) {
                            $scope.load = false;
                            console.log(error);
                        });
                }).catch(function (err) {
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    //   console.log(err);
                })


        };
        // var getLogoPath = function (org) {
        //    return logoPath.getLogo(org)
        // }
        return {
            getEmail: getEmail,
            checkClientStatus: checkClientStatus

        }
    }
]);