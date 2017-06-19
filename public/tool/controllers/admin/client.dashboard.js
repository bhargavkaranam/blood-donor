var app = angular.module('phive');

app.controller('sellerDashboard', ['$scope', '$state', '$location', 'breadCrumb', 'getEmailId', 'currentAuth', 'logoPath', '$firebaseObject', 'getFirebaseRef',
    function ($scope, $state, $location, breadCrumb, getEmailId, currentAuth, logoPath, $firebaseObject, getFirebaseRef) {
        $scope.authData = currentAuth;
        $scope.load = true;
        breadCrumb.setDashScope($scope);
        var ref = getFirebaseRef.ref;
        // any time auth status updates, add the user data to scope

        $scope.load = false;
        $scope.msg = "No client is present.";

        if ($location.search().id) {
            var org = $location.search().id;
            $scope.cRegister = "#/admin/register?reg=" + org;
            $scope.logo = logoPath.getLogo(org).logo;
            var arr = [], j = 0;
            var getSellersClient = ref.child('users/clientMapping');
            var sellerObj = $firebaseObject(getSellersClient.orderByChild('org').equalTo(org))
            sellerObj.$loaded()
                .then(function (data) {
                    var snapdata = data;
                    var keys = Object.keys(data);
                    for (var i = 0; i < keys.length; i++) {
                        if (keys[i].startsWith('$')) {
                            delete snapdata[keys[i]];
                        } else {
                            j++;
                            snapdata[keys[i]].email = keys[i].replace(/,/g, ".");
                            snapdata[keys[i]].position = j;
                            arr.push(snapdata[keys[i]]);

                            $scope.snapdata = snapdata[keys[i]];
                        }

                    }
                    if (arr.length > 0) {
                        $scope.snapdata = arr;
                        $scope.data = arr;
                    } else {
                        // no data
                    }
                    $scope.load = false;
                })
                .catch(function (err) {
                    console.log(err);
                    $scope.load = false;
                })

            //   once('value').then(function (snap) {
            //     var snapData = snap.val();
            //     var i=1;
            //     for (var key in snapData) { 
            //         var value = snapData[key];
            //         value.email=key.replace(/,/g , ".");
            //         value.postion=i++;
            //     }
            //     $scope.data = snapData;
            // }).catch(function (err) {
            //     console.log(err);
            // })

            // later create the service

        } else {
            $scope.logo = "assets/img/logo.png";
        }

        console.log('index');
        if (!currentAuth) {
            $state.go('index');
        }

    }
]);