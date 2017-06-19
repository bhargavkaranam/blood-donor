/**
 * Master Controller
 */

angular.module('phive')
    .controller('MasterCtrl', ['$scope', '$cookieStore', '$uibModal', '$log', '$firebaseObject', MasterCtrl]);

function MasterCtrl($scope, $cookieStore, $uibModal, $log, $firebaseObject) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.animationsEnabled = true;

    $scope.open = function (size) {

        var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'views/modals/client.campaign.modal.html',
        controller: 'campaignModal',
        backdrop: 'static',
        size: size,
        resolve :{
             "currentAuth": ["Auth", function (Auth) {
                        return Auth.$waitForSignIn();
                    }]
        }
        });

        // modalInstance.result.then(function (selectedItem) {
        // $scope.selected = selectedItem;
        // }, function () {
        // $log.info('Modal dismissed at: ' + new Date());
        // });
    };
  
    $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;
            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() {
        $scope.$apply();
    };
    //  var ref = new Firebase(firebase_url+"check1");
    //    $scope.data = $firebaseObject(ref);
    
    // $scope.filters = {
    //     category: [
    //         "Beauty & Fitness",
    //         "Comedy & Entertainment",
    //         "Technology",
    //         "Food Era",
    //         "Gaming",
    //         "Others"   
    //     ],
    //     region: {
    //        ind: "India",
    //        usa: "USA",
    //        germany: "germany"
              
    //     },
    //     popularity: [
            
    //     ],
    //     pricing: [
            
    //     ],
    //     availability: [
            
    //     ], 
    //     networks: [
            
    //     ],
    //     gender: [
            
    //     ],
    //     ratings: [
            
    //     ],
    //     genre: [
                       
    //     ],
    //     agegroup:[
            
    //     ]   
    // };
}