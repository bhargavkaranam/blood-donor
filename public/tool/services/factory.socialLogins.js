angular.module('phive').factory('socialLogins', ['getFirebaseRef', 'Auth', '$firebaseObject', '$state', '$location', 'getMessage', '$http', '$uibModal',
    function (getFirebaseRef, Auth, $firebaseObject, $state, $location, getMessage, $http, $uibModal) {
        var ref = getFirebaseRef.ref;
        var fbAuth = getFirebaseRef.auth;
        var auth = Auth;
        
        var googleProvider = new firebase.auth.GoogleAuthProvider();
        googleProvider.addScope('email');

        var gitProvider = new firebase.auth.GithubAuthProvider();
        gitProvider.addScope('user:email');

        var loginWithGoogle = function ($scope) {
            fbAuth.signInWithPopup(googleProvider).then(function(result) {
                // User signed in!
                $scope.load = true;
                $scope.username = result.user.providerData[0].displayName;
                var email = result.user.providerData[0].email;
                var name = $scope.username;
                var uid = result.user.providerData[0].uid;
                // var provider = result.user.providerData[0].providerId;
                var provider = 'google';
                socialLogin($scope, uid, email, name, provider);                

            }).catch(function(error) {
            // An error occurred
                $scope.load = false;
            });
        };

        var loginWithGitHub = function ($scope) {
            fbAuth.signInWithPopup(gitProvider).then(function(result) {
                // User signed in!
                $scope.load = true;
                var email = result.user.providerData[0].email;
                var name = result.user.providerData[0].username;
                var uid = result.user.providerData[0].uid;
                var provider = result.user.providerData[0].providerId;
                socialLogin($scope, uid, email, name, provider);              

            }).catch(function(error) {
            // An error occurred
                $scope.load = false;
            });
        };
        // var loginWithGoogle = function ($scope) {
        //     ref.authWithOAuthPopup("google", function (error, authData) {
        //         if (error) {
        //             //  console.error("Authentication failed:", error);
        //             $scope.load = false;
        //         }
        //         else {
        //             $scope.load = true;
        //             //  console.log("Authenticated successfully with payload:", authData);
        //             $scope.username = authData.google.displayName;
        //             var email = authData.google.email;
        //             var name = $scope.username;
        //             var uid = authData.uid;
        //             var provider = authData.provider;
        //             socialLogin($scope, uid, email, name, provider);
        //         }
        //     }, {
        //             scope: "email"
        //         }
        //     )
        // };

        // var loginWithGitHub = function ($scope) {
        //     ref.authWithOAuthPopup("github", function (error, authData) {
        //         if (error) {
        //             //  console.error("Authentication failed:", error);
        //             $scope.load = false;
        //         }
        //         else {
        //             $scope.load = true;
        //             // console.log("Authenticated successfully with payload:", authData);
        //             var email = authData.github.email;
        //             var name = authData.github.username;
        //             var uid = authData.uid;
        //             var provider = authData.provider;
        //             socialLogin($scope, uid, email, name, provider);

        //         }

        //     }, {
        //             remember: "sessionOnly",
        //             scope: "user:email"
        //         });
        // };
        
        var socialLogin = function ($scope, uid, email, name, provider) {
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var userRef = ref.child('users').child('clientMapping').child(key);
            userRef.once("value", function (snap) {
                if (!snap.exists()) {
                    var userData = {
                        email: email,
                        user_uid: uid,
                        name: name,
                        authorized: true,
                        term: true,
                        provider: provider
                    };
                    var getAdminData = {
                        email: email
                    }
                    console.log('saasaaasasa');
                    $http.get('/getAdmin', { params: getAdminData }).then(function (success) {
                        if (success.data.status) {
                            console.log('you are already invited ');
                            var invitedUserRole = success.data.role;
                            var invitedUserhasId = success.data.hashId;
                            var invitedCompany = success.data.company;
                            //popup to confirm
                            $scope.animationsEnabled = true;
                            $scope.conf = false;
                            $scope.load = false;
                            var modalInstance = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'views/modals/client.invited.modal.html',
                                controller: 'invitedModal',
                                resolve: {
                                    data: function () {
                                        return {
                                            role: invitedUserRole,
                                            company: invitedCompany
                                        }
                                    },

                                }
                            });
                            modalInstance.result.then(function (data) {
                                $scope.conf = data;
                                if ($scope.conf) {
                                    //invitation accepted
                                    var Details = {
                                        email: email,
                                        hashId: invitedUserhasId,
                                        role: invitedUserRole,
                                        invitation: 'accepted'
                                    }
                                    $scope.load = true;
                                    //set the invitation node to accepted
                                    $http.get('/setAdmin', { params: Details }).then(function (mailResult) {
                                        $scope.load = true;
                                        //register user as invited user
                                        var mapClientData = JSON.stringify({
                                            email: email,
                                            hashId: invitedUserhasId,
                                            role: invitedUserRole,
                                            name: name,
                                            term: true,
                                            invitedUser: true,
                                            provider: provider
                                        })
                                    var mapClient = JSON.stringify({
                                            email: email,
                                            hashId: invitedUserhasId,
                                            role: invitedUserRole,
                                            name: name,
                                            term: true,
                                            invitedUser: true,
                                            provider: provider,
                                            invitedUser : true,
                                            user_uid : uid,
                                            authorized : true
                                        })
                                        notInvitedUser(mapClient, $scope);
                                    }, function (err) {
                                        console.log(err);
                                    }).catch(function (err) {
                                        console.log(err);
                                    });
                                }
                                else {
                                    if (!$scope.conf) {
                                        //invitation rejected
                                        var Details = {
                                            email: email,
                                            hashId: invitedUserhasId,
                                            role: invitedUserRole,
                                            invitation: 'rejected'
                                        }
                                        $scope.load = true;
                                        //set the invitation node to rejected
                                        $http.get('/setAdmin', { params: Details }).then(function (mailResult) {
                                            $scope.load = true;
                                            //register user as regular user
                                            notInvitedUser(userData, $scope);

                                        }, function (err) {
                                            console.log(err);
                                        }).catch(function (err) {
                                            console.log(err);
                                        });
                                    }
                                }
                            })
                        }
                        else {
                            if (!success.data) {
                                $scope.load = true;
                                notInvitedUser(userData, $scope);
                            }
                        }
                    }, function (err) {
                        $scope.load = false;
                        console.log('err during getting data firebase');
                    }).catch(function (err) {
                        console.log(err);
                    })
                } else {
                    var snapData = snap.val();
                    var hashId = snapData.hashId;
                    var role = snapData.role;
                    var siteName;
                    var siteAdminData = JSON.stringify({
                        email: email,
                        role: role,
                        name: name,
                        provider: provider,
                        uid: uid,
                        hashId: hashId
                    })
                    $http.post('/mapSiteAdmin', siteAdminData).then(function (success) {
                        if (success.data) {
                            $scope.load = false;
                            $state.go('dashboard.home');
                        }
                        else {
                            if (!success.data) {
                                $scope.load = false;
                                $scope.result = true;
                                $scope.msg = getMessage.GetData('register_failure');
                            }
                        }
                    }).catch(function (err) {
                        $scope.load = false;
                        //show message;
                        $scope.result = true;
                        $scope.msg = getMessage.GetData('register_failure');
                    }); // rest ended
                }
            });
        };
        var checkMailInDB = function (email) {
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var usersRef = ref.child('users').child('clientMapping');
            var id;
            usersRef.orderByKey().equalTo(key).on("child_added", function (snapshot) {
                return snapshot.key();
            });
            //  id;
        };
        var invitedUser = function (mapClientData, $scope) {
            $http.post('/createNode', mapClientData).then(function (success) {
                if (success.data) {
                    $scope.load = false;
                    $scope.result = true;
                    $scope.msg.success = true;
                    $scope.infoSuccess = getMessage.GetData('register_success_invitedUser');
                    $state.go('dashboard.home');
                }
                else {
                    if (!success.data) {
                        $scope.load = false;
                        $scope.result = true;
                        $scope.msg.failure = true;
                        $scope.err = getMessage.GetData('register_failure');
                    }
                }
            }, function (err) {
                $scope.load = false;
                //show message;
                $scope.msg.failure = true;
                $scope.result = true;
                $scope.err = getMessage.GetData('register_failure');
            }).catch(function (err) {
                console.log(err);
            });
        };
        var notInvitedUser = function (userData, $scope) {
            $http.post('/signUp', userData).then(function (success) {
                //    console.log(success);
                $state.go('dashboard.home');
            }, function (err) {
                $scope.load = false;
                $scope.msg.failure = true;
                $scope.showMsg = true;

            }).catch(function (err) {
                console.log(err);
            });
        };

        return {
            loginWithGoogle: loginWithGoogle,
            loginWithGitHub: loginWithGitHub

        }
    }
]);