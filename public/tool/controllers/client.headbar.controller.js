angular.module('phive')
    .controller('headbarController', ['$scope', '$state', '$firebaseObject', '$firebaseAuth', 'getFirebaseRef', 'breadCrumb', 'currentAuth', 'getEmailId', 'getMessage', 'findName', '$q', headbarController]);

function headbarController($scope, $state, $firebaseObject, $firebaseAuth, getFirebaseRef, breadCrumb, currentAuth, getEmailId, getMessage, findName, $q) {
    $scope.critical = false;
    $scope.severe = false;
    $scope.showTrail = false;
    $scope.trailMsg = '';
    $scope.hideWarning = true;
    $scope.headerBreadCrumb = {};
    var currentAuth = currentAuth;
    var controllerCode = function (ref, data) {
        var role = data.role;
        var hashId = data.hashId;
        if (role === 'marketer') {
            var roleNode = 'mktAdmin';
        }
        if (role === 'developer') {
            var roleNode = 'devAdmin';
        }
        // get user name
        var promise = $q(function (resolve, reject) {
            findName.getName(hashId, currentAuth, roleNode).then(resolve);
        }).then(function (username) {
            $scope.username = username;
        })

        // bind company name
        var companyRef = $firebaseObject(ref.child('users').child(hashId).child('details').child('companyDetails'));
        companyRef.$loaded(function (company) {
            company = company.name;
            if (company == undefined || company == '')
                company = 'Organization';
            $scope.companyName = company;
        });


        // var freeRef = ref.child('users').child(hashId).child('details').child('packageDetails').child('current').child('freeTrial');
        // var trialObj = $firebaseObject(freeRef);
        // trialObj.$loaded()
        //     .then(function (trialData) {
        //         if (trialData.$value) {
        //             if (trialData.$value <= 7) {
        //                 $scope.showTrail = true;
        //                 $scope.trailMsg = getMessage.GetData('free_credits');
        //                 $scope.days = trialData.$value;
        //             }
        //         }
        //         console.log('data ' + trialData.$value);
        //     })
        //     .catch(function (error) {
        //         console.error("Error:", error);
        //     });

    };

    if (!currentAuth) {
        $state.go('index');
    }
    else {
        var ref = getFirebaseRef.ref;
        var fbAuth = getFirebaseRef.auth;
        $scope.authObj = $firebaseAuth(fbAuth);

        $scope.logout = function () {
            window.sessionStorage.removeItem("currentPage");
            if ($scope.logo) {
                localStorage.setItem('widely::logoPath', $scope.logo);
            }
            $scope.authObj.$signOut();
            //ref.unauth();
            fbAuth.signOut();
            $state.go('index');
        }

        //breadcrumb-links
        breadCrumb.setScope($scope);
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}




