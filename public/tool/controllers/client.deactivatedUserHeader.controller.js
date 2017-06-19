angular.module('phive')
    .controller('deactivatedUserHeadbarController', ['$scope','$state', '$firebaseObject', '$firebaseAuth','getFirebaseRef','currentAuth','getEmailId',deactivatedUserHeadbarController]);

function deactivatedUserHeadbarController($scope,$state, $firebaseObject, $firebaseAuth,getFirebaseRef,currentAuth,getEmailId) {
      if(currentAuth === null)
        {
            $state.go('index');
        }
        else {
            var ref = getFirebaseRef.ref;
            var fbAuth = getFirebaseRef.auth;
            $scope.authObj = $firebaseAuth(fbAuth);

            $scope.logout = function () {
                $scope.authObj.$signOut();
                // ref.unauth();
                fbAuth.signOut();
                $state.go('index');
            }


            //breadcrumb-links
            $scope.viewState = $state.current.name;



            // get HashId 

           var email =  getEmailId.getEmail(currentAuth);
            var key = email.replace(/[.$\[\]\/#]/g, ',');
            var obj = $firebaseObject(ref.child('users/clientMapping/').child(key));
            obj.$loaded()
                .then(function (data) {
                    var hashId = data.hashId;
                    var role=data.role;
                    if(role==='marketer')
                    {
                        var roleNode='mktAdmin';
                    }
                    if(role==='developer')
                    {
                        var roleNode='devAdmin';
                    }
                    // get user name             
                    var updatedRef = ref.child('users').child(hashId).child('clientUsers').child(roleNode).child(currentAuth.uid);
                    var obj = $firebaseObject(updatedRef);
                    obj.$loaded(
                        function (data) {
                            $scope.username = data.name;
                        },
                        function (error) {
                            console.error("Error:", error);
                        }
                    );
                })
        }
    } // close on onAuth
   



