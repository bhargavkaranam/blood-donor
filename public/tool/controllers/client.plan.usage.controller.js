var app = angular.module('phive');
app.controller('planUsageController', ['$scope', '$firebaseObject',
    '$state', 'getState', 'getMessage', '$location', 'filterDate', 'breadCrumb', 'currentAuth', 'getEmailId', planUsageController]);

function planUsageController($scope, $firebaseObject, $state,
    getState, getMessage, $location, filterDate, breadCrumb, currentAuth, getEmailId) {

    window.sessionStorage.setItem('currentPage', $location.path());
    $scope.load = true;
    console.log($state.current.name);
    console.log(getState.GetData($state.current.name));

    var breadcrumbData = {};
    breadcrumbData.breadCrumbHead = getState.GetData($state.current.name);
    breadcrumbData.bCrumblink_first = '';
    breadcrumbData.href_first = '';
    breadcrumbData.bCrumbForSecElement = "";
    breadcrumbData.hrefForSecElement = "";
    breadCrumb.setbreadCrumbData(breadcrumbData);

    var controllerCode = function (ref, data) {
        var hashId=data.hashId;
        filterDate.show(false);
        var updatedRef = ref.child('users').child(hashId).child('details').child('packageDetails').child('current');
        var obj = $firebaseObject(updatedRef);
        obj.$loaded()
            .then(function (currentData) {
                $scope.currentData = currentData;
                $scope.load = false;
                $scope.dataRest = [700, 300];
                $scope.colorsRest = ["#fd586f", "#02ceff"];
                $scope.mauLabels = ["Consumed", "Remaining"];
                $scope.subscriberLabels = ["Consumed", "Remaining"];
                var subscriberRemaining;
                var mauRemaining, subscriberRemaining;
                var subscriberConsumedPercent, mauConsumedPercent;

                subscriberConsumedPercent = Math.round(currentData.consumedSubscriberPercent || 0);
                mauConsumedPercent = Math.round(currentData.consumedMAUPercent || 0);

                // check if consumptionPercent exceed
                if (subscriberConsumedPercent >= 100) {
                    subscriberRemaining = 0;
                } else {
                    subscriberRemaining = 100 - subscriberConsumedPercent;
                } 

                if(mauConsumedPercent >= 100){
                   mauRemaining = 0;
                } else {
                   mauRemaining = 100 - mauConsumedPercent;
                }

                $scope.subscriberData = [subscriberConsumedPercent, subscriberRemaining];
                $scope.mauData = [mauConsumedPercent, mauRemaining];


                $scope.currentData.planSubscriber = currentData.planSubscriber || 1000;
                $scope.currentData.consumedSubscriber = currentData.consumedSubscriber || 0; 
                $scope.currentData.planMAU = currentData.planMAU || 1000;
                $scope.currentData.consumedMAU = currentData.consumedMAU || 0; 


            }, function (error) {
                console.log(error);
            })
        $scope.upgradePlan = function () {
            $scope.load = true;
            $state.go('dashboard.plans');
        }
    };
    // any time auth status updates, add the user data to scope
    if (currentAuth === null) {
        $state.go('index');
    } else {
        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
    }
  
}