var app = angular.module('phive');

app.controller('showCampaign', ['$scope', '$state', 'productService', 'productId',
    '$firebaseObject', '$uibModal',
    'getMessage', 'getState', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId',
    function ($scope, $state, productService, productId,
        $firebaseObject, $uibModal, getMessage, getState, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

        window.sessionStorage.setItem('currentPage', $location.path());
        $scope.load = true;

        var breadcrumbData = {};
        breadcrumbData.breadCrumbHead = 'Actions /';
        breadcrumbData.bCrumblink_first = getState.GetData($state.current.name);
        breadcrumbData.href_first = '#' + $location.$$url;
        breadcrumbData.bCrumbForSecElement = "";
        breadcrumbData.hrefForSecElement = "";
        breadCrumb.setbreadCrumbData(breadcrumbData);


        // any time auth status updates, add the user data to scope
        if (currentAuth === null) {
            $state.go('index');
        } else {
            $scope.result = false; // default hide msg  
            // $scope.isCollapse=false; 
        var controllerCode = function (ref, data) {
            var hashId=data.hashId;
            filterDate.show(false);

            var templates = productService.template(hashId);
            templates.$loaded()
                .then(function (temp) {

                    $scope.load = false; // disable loader
                    if (temp.length == 0) {
                        $scope.msg = "No Campaigns Yet!";
                        $scope.result = true;
                    } else {

                        var userInsights = $firebaseObject(ref.child('users').child(hashId).child('userInsights').child('campaigns'));
                        userInsights.$loaded().then(function (campaignStats) {
                            $scope.result = false;
                            $scope.templates = temp.reverse();

                            $scope.pagination = {
                                bigCurrentPage: 1,
                                maxSize: 5,
                                bigTotalItems: temp.length,
                                itemsPerPage: campaignStats.viewCampaignsLimit
                            };
                        }, function (error) {
                            $scope.load = false;
                            $scope.phd_errorMsg = getMessage.GetData('error');
                            $scope.phd_error = true;
                            console.log(error);
                        })
                    }

                    $scope.pageChanged = function () {
                        console.log('Page changed to: ' + $scope.pagination.bigCurrentPage);
                    };

                    $scope.delCamp = function (temp) {
                        $scope.animationsEnabled = true;
                        $scope.confDelete = false;
                        //
                        //take care of misuse
                        //
                        if (!temp.sentPushMessages) {
                            var modalInstance = $uibModal.open({
                                animation: $scope.animationsEnabled,
                                templateUrl: 'views/modals/client.delete.campaign.modal.html',
                                controller: 'deleteCampaignModel',
                                backdrop: 'static',
                                resolve: {
                                    campName: function () {
                                        return temp.Ctitle;
                                    }
                                }
                            });
                            modalInstance.result.then(function (data) {
                                $scope.confDelete = data;
                                if ($scope.confDelete) {
                                    //TODO : delete only who have 0 posts
                                    // $scope.isCollapse=true;
                                    temp.isCollapse = true;
                                    var index = templates.$indexFor(temp.$id);
                                    templates.$remove(index).then(function (dat) {
                                        console.log("template deleted ");
                                    })
                                }
                            }, function () {
                                console.log('camp deletion aborted by user');
                            })
                        } else {
                            console.log('this camp cant be deleted');
                        }
                    }

                }).catch(function (error) {
                    $scope.load = false;
                    $scope.phd_errorMsg = getMessage.GetData('error');
                    $scope.phd_error = true;
                    console.log("Error:", error);
                });
        };
            var email = getEmailId.getEmail(currentAuth);
            if (email) {
                getEmailId.checkClientStatus(email, controllerCode, $scope);
            }
        }
        
    }]);