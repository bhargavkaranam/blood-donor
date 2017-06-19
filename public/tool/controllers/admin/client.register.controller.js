'use strict';

var app = angular.module('phive');
app.controller('clientRegister', ['$scope', '$uibModal', '$http', 'getMessage', 'getEmailId', 'socialLogins', '$state', 'logoPath', '$location', clientRegister]);

function clientRegister($scope, $uibModal, $http, getMessage, getEmailId, socialLogins, $state, logoPath, $location) {

    // var authData = currentAuth;
    // if (authData != null) {
    //     $state.go('SMdashboard');
    // }
    $scope.msg = {
        success: '',
        failure: '',
    };

    // logo
    if ($location.search().reg) {
        var org = $location.search().reg;
        $scope.logo = logoPath.getLogo(org).logo;
        $scope.registerUrl = "#/?org="+org;
    } else {
        $scope.logo = "assets/img/logo.png";
        $scope.registerUrl = "#/";
    }

    $scope.result = false;
    $scope.load = false;
    $scope.notRecaptcha = false;
    $scope.term = true;
    $scope.passwordErrMsg = getMessage.GetData('register_invalid_password');
    $scope.recaptchaCallback = function () {

        $scope.notRecaptcha = false;
    }

    var email, pswd, name, company, term, inviteCode, password;

    $scope.register = function () {
        $scope.result = false;
        email = $scope.user.email;
        pswd = $scope.user.pswd;
        name = $scope.user.name;
        company = $scope.user.company;
        inviteCode = $scope.user.inviteCode;
        password = $scope.user.pswd;
        term = $scope.term;
        $scope.load = true;
        if (inviteCode && inviteCode.length <= 15) {
            $scope.load = false;
            $scope.result = true;
            $scope.msg.failure = true;
            $scope.err = getMessage.GetData('register_invalid_code');
        }
        if (typeof (email) !== "undefined" && typeof (pswd) !== "undefined" && typeof (name) !== "undefined" && term) {
            if (/^(?=.*[^a-zA-Z])(?=.*[0-9])\S{6,15}$/.test(pswd)) {

                $scope.notInvitedUser();

            } else {
                $scope.load = false;
                $scope.result = true;
                $scope.msg.failure = true;
                $scope.err = getMessage.GetData('register_invalid_password');
            }

        }// closing if block
        else {
            $scope.load = false;
            $scope.result = true;
            $scope.msg.failure = true;
            $scope.err = getMessage.GetData('register_failure');
        }

    }

    $scope.notInvitedUser = function () {
        var data =
            JSON.stringify({
                email: email,
                name: name,
                company: company,
                term: term,
                invitedUser: false,
                inviteCode: inviteCode,
                password: password,
                seller: org || ''
            })

        $http.post("/createNode", data)
            .then(function (res) {
                $scope.load = false;
                $scope.result = true;
                $scope.msg.success = true;
                $scope.infoSuccess = getMessage.GetData('seller_client_register_success');
                $scope.user = null;

            }, function (err) {
                console.log('err during createNode:- status :: ' + err.status + ',err.data :: ' + err.data);
                if (err.data && Object.keys(err.data).length) {
                    var message = getMessage.GetData('register_' + err.data);
                    if (message && typeof message === 'string' && message.length) {
                        $scope.load = false;
                        $scope.result = true;
                        $scope.msg.failure = true;
                        $scope.err = getMessage.GetData('register_' + err.data);
                    } else {
                        $scope.load = false;
                        $scope.result = true;
                        $scope.msg.failure = true;
                        $scope.err = getMessage.GetData('register_failure');
                    }
                } else {
                    $scope.load = false;
                    $scope.result = true;
                    $scope.msg.failure = true;
                    $scope.err = getMessage.GetData('register_failure');
                }

            })
    }


}
app.filter("sanitize", ['$sce', function ($sce) {
    return function (htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    }
}]);   