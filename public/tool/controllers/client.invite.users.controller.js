var app = angular.module('phive');
app.controller('inviteUsersController', ['$scope', '$state',
    '$http', '$firebaseObject', 'getFirebaseRef', 'getMessage', 'getState', '$location',
    'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', inviteUsersController]);

function inviteUsersController($scope, $state, $http,
    $firebaseObject, getFirebaseRef, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.isCollapsed = true;
    $scope.load = true;
    $scope.showMsg = false;
    $scope.userExceed = false;
    $scope.admExceed = false;

    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = '';
    breadcrumbData.href_first = '';
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        // get hash ID
        var mktCount = 0;
        var devCount = 0;
        var maxMarketer = 0;
        var maxDeveloper = 0;
        
        $scope.invitationMsg = {};
        var controllerCode = function (ref,data) {
        var hashId=data.hashId;
        filterDate.show(false);
        var maxAdminFirebase = $firebaseObject(ref.child('users').child(hashId).child('details').child('packageDetails').child('current'));
        maxAdminFirebase.$loaded()
            .then(function (data) {
                if (typeof (data.maxDeveloper) === 'undefined' || typeof (data.maxMarketer) === 'undefined') {
                    $scope.load = false;
                    console.log('maxDevelpoer Or maxMarketer is not set');
                    // console.log('setting to default value ');
                    // console.log('maxDeveloper=1 and maxMarketer=2');
                    // maxDeveloper = 1;
                    // maxMarketer = 2;
                }
                else {
                    maxMarketer = data.maxMarketer;
                    maxDeveloper = data.maxDeveloper;

                    //get dataspan from the firebase to add existing users
                    var dataFirebase = $firebaseObject(ref.child('users').child(hashId).child('clientUsers'));
                    dataFirebase.$loaded()
                        .then(function (admData) {
                            $scope.load = false;
                            devCount = Object.keys(admData.devAdmin || {}).length;
                            mktCount = Object.keys(admData.mktAdmin || {}).length;
                            $scope.mktAdmin = admData.mktAdmin;
                            $scope.devAdmin = admData.devAdmin;
                            if ((devCount + mktCount) >= (maxDeveloper + maxMarketer)) {
                                //  if ((devCount + mktCount) >= (4)) {
                                $scope.userExceed = true;
                                $scope.isCollapsed = false;
                            }
                        }, function (err) {
                            $scope.load = false;
                            $scope.phd_errorMsg = getMessage.GetData('error');
                            $scope.phd_error = true;
                            console.log('err getting data from firebase' + err);
                        })
                }
            }, function (err) {
                $scope.load = false;
                $scope.phd_errorMsg = getMessage.GetData('error');
                $scope.phd_error = true;
                console.log('err getting packageDetails form firebase', +err);
            })

        // this function is called when user press send button to send invitation 
        $scope.sendInviteToAdmin = function () {
            var setAdminDetails = {
                email: $scope.invite.email,
                hashId: hashId,
                role: $scope.invite.role,
                invitation: 'pending'
            }

            $scope.load = true;
            $http.get('/setAdmin', { params: setAdminDetails }).then(function (result) {
                $scope.load = false;
                // 
                $scope.infoSuccess = getMessage.GetData('invite_user_success');
                $scope.invitationMsg.success = true;
                $scope.showMsg = true;
            }, function (errorMsg) {
                console.log(errorMsg)
                $scope.load = false;
                $scope.infoSuccess = getMessage.GetData('invite_user_failure');
                $scope.invitationMsg.failure = true;
                $scope.showMsg = true;
            });

        }
        $scope.adminSelected = function () {
            $scope.showMsg = false;
            console.log($scope.invite.role);
            if ($scope.invite.role === 'developer') {
                if (devCount == maxDeveloper) {
                    $scope.infoSuccess = getMessage.GetData('invite_user_devExceed');
                    // $scope.infoSuccess = 'You can only have 1 developer';
                    $scope.invitationMsg.devExceed = true;
                    $scope.showMsg = true;
                    $scope.admExceed = true;
                    $scope.isCollapsed = false;
                }
                else {
                    $scope.amdExceed = false;
                }
            }
            if ($scope.invite.role === 'marketer') {
                if (mktCount == maxMarketer) {
                    $scope.infoSuccess = getMessage.GetData('invite_user_mktExceed');
                    // $scope.infoSuccess = 'You can have only 2 marketer';
                    $scope.invitationMsg.mktExceed = true;
                    $scope.showMsg = true;
                    $scope.admExceed = true;
                    $scope.isCollapsed = false;
                }
                else {
                    $scope.admExceed = false;
                }
            }
        }
    };

        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }

}