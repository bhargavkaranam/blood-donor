var app = angular.module('phive')
    .controller('invitedUserLogin', ['$scope', '$location', 'getFirebaseRef', '$firebaseAuth', '$http', 'getMessage', invitedUserLogin]);
function invitedUserLogin($scope, $location, getFirebaseRef, $firebaseAuth, $http, getMessage) {
    var ref = getFirebaseRef.ref;
    var fbAuth = getFirebaseRef.auth;
    var auth = $firebaseAuth(fbAuth);

    $scope.showMsg = false;
    $scope.passwordErrMsg = getMessage.GetData('register_invalid_password');
    $scope.term = true;
    var hashId = $location.search().hashID;
    var role = $location.search().role;

    $scope.onSubmit = function () {
        $scope.load = true;
        $scope.msg = {
            sucess: '',
            failure: ''
        }
        var dataCorrect = false;
        var email = $scope.invited.email;
        var pswd = $scope.invited.password;
        var name = $scope.invited.name;
        var term = $scope.term;
    
        if(pswd && typeof pswd === 'string' && /^(?=.*[^a-zA-Z])(?=.*[0-9])\S{6,15}$/.test(pswd)){
            if (typeof (email) !== "undefined" && typeof (pswd) !== "undefined" && typeof (name) !== "undefined" && term) {
                var getAdminData = {
                    hashId: hashId,
                    email: email
                }
                $http.get('/getAdmin', { params: getAdminData }).then(function (success) {
                    if (success.data.status) {
                        // console.log(success);

                        // auth.$createUser({
                        //     email: email,
                        //     password: pswd
                        // }).then(function (userData) {
                        //     console.log('user created successfully ' + userData.uid);

                        //rest call to map client
                        //if (userData.uid) {
                        var mapClientData = JSON.stringify({
                            email: email,
                            hashId: hashId,
                            role: role,
                            name: name,
                            term: term,
                            invitedUser: true,
                            password: pswd
                        })

                        $http.post('/createNode', mapClientData).then(function (success) {
                            //
                            //client mapped
                            var invitedUserDetails = {
                                email: email,
                                hashId: hashId
                            }

                            //
                            //invitation accepted
                            //
                            var Details = {
                                email: email,
                                hashId: hashId,
                                role: role,
                                invitation: 'accepted'
                            }
                            //
                            //set the invitation node to accepted
                            //
                            $http.get('/setAdmin', { params: Details }).then(function (mailResult) {

                                $scope.load = false;
                                $scope.infoSuccess = getMessage.GetData('invited_user_success');
                                $scope.msg.success = true;
                                $scope.showMsg = true;

                            }, function (err) {
                                console.log(err);
                                $scope.load = false;
                                $scope.infoErr = getMessage.GetData('invited_user_err');
                                $scope.msg.failure = true;
                                $scope.showMsg = true;
                            })
                            // $http.get('/deleteInvitedUser',{params: invitedUserDetails}).then(function(success){
                            //     if(success.data)
                            //     {
                            //         $scope.load = false;
                            //         $scope.msg.success = true;
                            //         $scope.showMsg = true;
                            //     }
                            //     else{
                            //         if(!success.data){
                            //             $scope.load = false;
                            //             $scope.msg.emailExist = true;
                            //             $scope.showMsg = true;
                            //         }
                            //     }

                            // },function(err){
                            //     console.log('error deleting node form invited user' +err);
                            //      $scope.load = false;
                            // //
                            // //show message;
                            // $scope.msg.failure = true;
                            // $scope.showMsg = true;
                            // })
                        }, function (err) {
                            //
                            //
                            $scope.load = false;
                            //
                            //show message;
                            $scope.infoErr = getMessage.GetData('invite_user_err');
                            $scope.msg.failure = true;
                            $scope.showMsg = true;

                        })
                        //  }

                        // }, function (notCreated) {
                        //     console.log('user creation unsuccessfull');
                        //     $scope.load = false;
                        //     //
                        //     //show message;
                        //     $scope.msg.failure = true;
                        //     $scope.showMsg = true;
                        // }) // user creation end 
                    }
                }, function (err) {
                    if (err.data) {
                        console.log(err);
                        console.log('not exist');
                        $scope.load = false;
                    }
                })
            }
        } else {
            $scope.load = false;
            $scope.infoErr = getMessage.GetData('register_invalid_password');
            $scope.msg.failure = true;
            $scope.showMsg = true;
        }

    }

}