angular.module('phive')
    .controller('campaignModal', ['$scope', '$uibModalInstance', 'config', '$firebaseArray', 'productService', 'updateTemplate', '$state', '$firebaseObject', 'getFirebaseRef', 'currentAuth', 'getEmailId', campaignModal]);

function campaignModal($scope, $uibModalInstance, config, $firebaseArray, productService, updateTemplate, $state, $firebaseObject, getFirebaseRef, currentAuth, getEmailId) {

    // any time auth status updates, add the user data to scope

    var controllerCode = function (ref, data) {
        $scope.field = {};
        var hashId = data.hashId;
        var obj = updateTemplate.getTemplate();

        if (typeof (obj) !== 'undefined') {

            // update template
            $scope.campaignId = obj.$id;
            $scope.field.Ctitle = obj.Ctitle;
            $scope.field.title = obj.title;
            $scope.field.content = obj.content;
            $scope.field.lurl = obj.lurl;
            $scope.field.imageUrl = obj.imageUrl;
        } else {

            $scope.field = {};
        }
        $scope.ok = function () {

            //get default image URL for push notification

            var notification_obj = $firebaseObject(ref.child('users').child(hashId).child('config').child('notificationUrl'));
            notification_obj.$loaded()
                .then(function (data) {
                    var notification_url = data.$value;
                    var campObj = {};
                    // check image for undefined
                    if ($scope.field.imageUrl === null || typeof ($scope.field.imageUrl) === 'undefined') {
                        $scope.field.imageUrl = notification_url;
                    }
                    // check title for undefined
                    if ($scope.field.title === null || typeof ($scope.field.title) === 'undefined') {
                        $scope.field.title = "";
                    }
                    // check content for undefined
                    if ($scope.field.content === null || typeof ($scope.field.content) === 'undefined') {
                        $scope.field.content = "";
                    }
                    // check landing url for undefined
                    if ($scope.field.lurl === null || typeof ($scope.field.lurl) === 'undefined') {
                        $scope.field.lurl = "";
                    }

                    var ctitle = $scope.field.Ctitle;
                    var title = $scope.field.title;
                    var content = $scope.field.content;
                    var lurl = $scope.field.lurl || '';
                    var imageUrl = $scope.field.imageUrl || '';

                    campObj.Ctitle = $scope.field.Ctitle;
                    campObj.title = $scope.field.title;
                    campObj.content = $scope.field.content;


                    if (typeof $scope.field.lurl != 'undefined' && $scope.field.lurl.length > 0) {
                        campObj.lurl = $scope.field.lurl;
                    }
                    if (typeof $scope.field.imageUrl != 'undefined' && $scope.field.imageUrl.length > 0) {
                        campObj.imageUrl = $scope.field.imageUrl;
                    }

                    campObj.timeStamp = global.getFirebaseRef.admin.database.ServerValue.TIMESTAMP;
                    // $scope.field.viewPostsLimit = 0;
                    if ($scope.campaignId === null || typeof ($scope.campaignId) === 'undefined') {
                        $scope.templates = productService.template(hashId); // get the firebase array                            
                        $scope.templates.$add(campObj)
                            .then(function () {
                                console.log('done');
                            })
                            .catch(function (err) {
                                console.log(err);
                            })

                        $scope.field = undefined;
                        $uibModalInstance.close('close');
                        $state.reload();
                    } else {

                        // update template
                        var updatedArr = $firebaseArray(ref.child('users').child(hashId).child('templates'));
                        updatedArr.$loaded()
                            .then(function (x) {
                                var campId = $scope.campaignId;
                                var index = updatedArr.$indexFor(campId);
                                console.log(" index of array " + index);
                                updatedArr[index].Ctitle = $scope.field.Ctitle;
                                updatedArr[index].title = $scope.field.title;
                                updatedArr[index].content = $scope.field.content;

                                if (typeof $scope.field.lurl != 'undefined' && $scope.field.lurl.length > 0) {
                                    updatedArr[index].lurl = $scope.field.lurl;
                                }
                                if (typeof $scope.field.imageUrl != 'undefined' && $scope.field.imageUrl.length > 0) {
                                    updatedArr[index].imageUrl = $scope.field.imageUrl;
                                }

                                // updatedArr[index].lurl = $scope.field.lurl;
                                // updatedArr[index].imageUrl = $scope.field.imageUrl;

                                updatedArr.$save(index).then(function (ref1) {
                                    console.log("campaign updated ");

                                    updateTemplate.setTemplate({});
                                    $scope.field = undefined;
                                    $uibModalInstance.close('close');
                                    $state.reload();
                                }, function (error) {
                                    console.log("Error:", error);
                                });

                            })
                            .catch(function (error) {
                                console.log("Error:", error);
                            });
                    }

                })
                .catch(function (error) {
                    console.error("Error:", error);
                });
            $state.reload();

        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    };


    if (currentAuth === null) {
        $state.go('index');
    }
    else {
        var ref = getFirebaseRef.ref;
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
}