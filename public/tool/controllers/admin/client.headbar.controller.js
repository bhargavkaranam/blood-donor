angular.module('phive')
    .controller('sellerHeadbar', ['$scope', '$state', '$firebaseObject', '$firebaseAuth', 'getFirebaseRef', 'breadCrumb', 'currentAuth', 'getEmailId', 'getMessage', 'findName', '$q', sellerHeadbar]);

function sellerHeadbar($scope, $state, $firebaseObject, $firebaseAuth, getFirebaseRef, breadCrumb, currentAuth, getEmailId, getMessage, findName, $q) {
    $scope.critical = false;
    $scope.severe = false;
    $scope.showTrail = false;
    $scope.trailMsg = '';
    $scope.hideWarning = true;
    $scope.headerBreadCrumb = {};
    var currentAuth = currentAuth;
    // var controllerCode = function (ref, data) {
    //     var role = data.role;
    //     var hashId = data.hashId;
    //     if (role === 'marketer') {
    //         var roleNode = 'mktAdmin';
    //     }
    //     if (role === 'developer') {
    //         var roleNode = 'devAdmin';
    //     }
    //     // get user name
    //     var promise = $q(function (resolve, reject) {
    //         findName.getName(hashId, currentAuth, roleNode).then(resolve);
    //     }).then(function(username) {
    //         $scope.username = username;
    //     })

    //     // bind company name
    //     var companyRef = $firebaseObject(ref.child('users').child(hashId).child('details').child('companyDetails'));
    //     companyRef.$loaded(function (company) {
    //         company = company.name;
    //         if (company == undefined || company == '')
    //             company = 'Organization';
    //         $scope.companyName = company;
    //     });

    // };

    if (!currentAuth) {
        $state.go('SMindex');
    }
    else {
        var ref = getFirebaseRef.ref;
        var fbAuth = getFirebaseRef.auth;
        $scope.authObj = $firebaseAuth(fbAuth);

        $scope.logout = function () {
            window.sessionStorage.removeItem("currentPage");
            $scope.authObj.$signOut();
            // ref.unauth();
            fbAuth.signOut();
            $state.go('SMindex');
        }

        //breadcrumb-links
        // breadCrumb.setScope($scope);
        // var email = getEmailId.getEmail(currentAuth);
        // if (email) {
        //     getEmailId.checkClientStatus(email, controllerCode, $scope);
        // }
    }
}




