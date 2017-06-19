var app = angular.module('phive');

app.controller('dashboardIndexController', ['$scope', '$state', 'currentAuth', '$location', 'breadCrumb', 'getEmailId','logoPath',
    function ($scope, $state, currentAuth, $location, breadCrumb, getEmailId, logoPath) {
        $scope.authData = currentAuth;
        $scope.load = true;
        breadCrumb.setDashScope($scope); 
        // any time auth status updates, add the user data to scope
        // $scope.auth.$onAuth(function (authData) {
        // $scope.authData = authData;


        if (!currentAuth) {
            $state.go('index');
        }

        var email = getEmailId.getEmail(currentAuth);
        if (email) {
            getEmailId.checkClientStatus(email, controllerCode, $scope);
        }
        function controllerCode() { 
            if (window.sessionStorage.getItem('currentPage')) { 
                $scope.load = false;
                $location.path(window.sessionStorage.getItem('currentPage'));
            }
            else {
                $scope.load = false;
                $state.go('dashboard.home');
            }
        }

    }
]);