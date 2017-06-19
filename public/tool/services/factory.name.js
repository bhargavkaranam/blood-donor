var app = angular.module('phive');


app.factory('findName', ['$firebaseObject', 'getFirebaseRef',
    function ($firebaseObject, getFirebaseRef) {
        var getName = function (hashId, currentAuth, roleNode) {
            var ref = getFirebaseRef.ref;
            var provider = currentAuth.providerData[0].providerId;
            if(provider === 'google.com'|| provider === 'google'){
                provider = 'google';
                }
            else if(provider === 'github'){
                provider = 'github';
                }
            else{
                provider = 'password';
                }

            var siteAdminRef = ref.child('users').child(hashId).child('siteadmin').child(provider);
            var mainObj = $firebaseObject(siteAdminRef);
            return mainObj.$loaded(function (siteProviderData) {

                if (typeof siteProviderData[currentAuth.uid] === 'object') {
                    // var siteData = siteAdminRef.child(currentAuth.uid);
                    var name = siteProviderData[currentAuth.uid].name;
                    return name;

                } else {
                    var updatedRef = ref.child('users').child(hashId).child('clientUsers').child(roleNode).child(currentAuth.uid);
                    var obj = $firebaseObject(updatedRef);
                    return obj.$loaded(
                        function (data) {
                            switch (provider) {
                                case 'google':
                                    return currentAuth.providerData[0].displayName;
                                    break;
                                case 'github':
                                    return currentAuth.providerData[0].username;
                                    break;
                                default:
                                    return data.name;
                            }
                        },
                        function (error) {
                            console.error("Error:", error);
                            return 'Unknown';
                        }
                    );

                }
            });
        }
        return {
            getName: getName
        }
    }
]);

