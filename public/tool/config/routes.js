

/**
     * Route configuration for the phive module.
 */
var app = angular.module('phive');


app.run(["$rootScope", "$state", "$firebaseArray", function ($rootScope, $state, $firebaseArray) {
    $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
        // We can catch the error thrown when the $requireAuth promise is rejected
        // and redirect the user back to the home page
        if (error === "AUTH_REQUIRED") {
            $state.go("index");
        }
    });

}]);
app.config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                views: {

                    '': {
                        templateUrl: 'views/login.html',
                        controller: 'loginController'
                    },

                    // the child views will be defined here (absolutely named)
                    'headbar@index': {
                        templateUrl: 'views/loginHeadbar.html'
                    },
                }
                ,
                resolve: {
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }],
                    "currentAuth": ["Auth", function (Auth) {

                        return Auth.$waitForSignIn();
                    }]
                }
            })
            .state('admin', {
                url: '/admin',
                views: {
                    '': {
                        templateUrl: 'views/admin/admin.html',
                        controller: 'adminController'
                    },

                    // the child views will be defined here (absolutely named)
                    'headbar@admin': {
                        templateUrl: 'views/admin/loginHeadbar.html'
                    },
                },
                resolve: {
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }],
                    "currentAuth": ["Auth", function (Auth) {
                        return Auth.$waitForSignIn();
                    }]
                }
            })
            .state('seller', {
                url: '/admin/seller',
                views: {
                    '': {
                        templateUrl: 'views/admin/seller.html',
                        controller: 'sellerDashboard'
                    },
                    'headbar@seller': {
                        templateUrl: 'views/admin/headbar.html',
                        controller: 'sellerHeadbar'
                    },

                    'sidebar@seller': {
                        templateUrl: 'views/admin/sidebar.html'
                    },
                },
                resolve: {
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }],
                    "currentAuth": ["Auth", function (Auth) {
                        return Auth.$waitForSignIn();
                    }]
                }
            })
            .state('clientRegister', {
                url: '/admin/register',
                views: {
                    '': {
                        templateUrl: 'views/admin/register.html',
                        controller: 'clientRegister'
                    },

                    'headbar@clientRegister': {
                        templateUrl: 'views/admin/loginHeadbar.html'
                    },
                },
                resolve: {
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                }
            })
            .state('dashboard', {
                url: '/dashboard',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        if (Auth.$getAuth()) {
                            return Auth.$getAuth();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/dashboard.html',
                        controller: 'dashboardIndexController'
                    },
                    // the child views will be defined here (absolutely named)
                    'headbar@dashboard': {
                        templateUrl: 'views/headbar.html',
                        controller: 'headbarController'
                    },
                    // for column two, we'll define a separate controller 
                    'sidebar@dashboard': {
                        templateUrl: 'views/sidebar.html'
                    },
                    'dateFilter@dashboard': {
                        templateUrl: 'views/dateFilter/dateFilter.html',
                        controller: 'dateFilterController'
                    }

                }
            })
            .state('dashboard.home', {
                url: '/home',
                templateUrl: 'views/dashboard.home.html',
                controller: 'dashboardController',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$getAuth()) {
                            return Auth.$getAuth();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                }
            })
            .state('forgetPassword', {
                url: '/forgot-password',
                views: {
                    '': {
                        templateUrl: 'views/forgetPassword.html',
                        controller: 'forgetlogincontroller',
                    },
                    'headbar@forgetPassword': {
                        templateUrl: 'views/loginHeadbar.html'
                    }
                }
            })
            .state('resetPassword', {
                url: '/reset-password',
                resolve :{
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/resetPassword.html',
                        controller: 'resetpasswordcontroller'
                    },
                    'headbar@resetPassword': {
                        templateUrl: 'views/loginHeadbar.html'
                    }
                }
            })
            .state('admDashboard', {
                url: '/admin-dashboard',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        // $waitForAuth returns a promise so the resolve waits for it to complete
                        return Auth.$waitForSignIn();
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/adminDashboard.html',
                        controller: 'admDashboardController'
                    },
                }
            })
            .state('userDetails', {
                url: '/user-details',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/userDetails.html',
                        controller: 'admUserdetailsController'
                    },
                }
            })
            .state('dashboard.customization', {
                url: '/customization',
                templateUrl: 'views/customization.html',
                controller: 'customizationController',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "tooltip": ['getToolTip', function (getToolTip) {
                        return getToolTip.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                }
            })
            .state('dashboard.campaigns', {
                url: '/campaigns',
                templateUrl: 'views/campaigns.html',
                controller: 'showCampaign',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                }
            })
            .state('dashboard.segments', {
                url: '/create-segments',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/segments.html',
                        controller: 'segmentsController'
                    }
                }
            })
            .state('dashboard.campaignDetails', {
                url: '/campaign-details',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                params: {
                    hashId: null
                },
                views: {
                    '': {
                        templateUrl: 'views/campaign-details.html',
                        controller: 'campaignDetail'
                    }
                }
            })
            .state('register', {
                url: '/register',
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/register.html',
                        //  templateUrl: 'views/TempRegister.html',
                        controller: 'registerController'
                    },

                    // the child views will be defined here (absolutely named)
                    'headbar@register': {
                        templateUrl: 'views/loginHeadbar.html'
                    },
                },
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        return Auth.$waitForSignIn();
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                }
            })
            .state('dashboard.subscriberSegments', {
                url: '/subscriber-segments',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/showSegments.html',
                        controller: 'showSegmentsController'
                    }
                }
            })
            .state('dashboard.inviteUsers', {
                url: '/invite-users',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/inviteUsers.html',
                        controller: 'inviteUsersController'
                    }
                }

            })
            .state('dashboard.accountInfo', {
                url: '/account-information',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/accountInfo.html',
                        controller: 'accountInfoController'
                    }
                }

            })
            .state('dashboard.setupFlow', {
                url: '/setup-flow',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/setupFlow.html',
                        controller: 'setupFlowController'
                    }
                }

            })
            .state('registerAdmin', {
                url: '/register-administrator',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        return Auth.$requireSignIn();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/registerAdmin.html',
                        controller: 'registerAdminController'
                    }
                }
            })
            .state('dashboard.plugAndPlay', {
                url: '/plug-and-play',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "tooltip": ['getToolTip', function (getToolTip) {
                        return getToolTip.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/plugAndPlay.html',
                        controller: 'plugAndPlayController'
                    }
                }
            })
            .state('dashboard.sendPushNotification', {
                url: '/send-push-notification',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/send-push.html',
                        controller: 'sendPushNotification'
                    }
                }
            })
            .state('dashboard.setWelcomeMessage', {
                url: '/set-welcome-message',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/welcome.html',
                        controller: 'welcomeController'
                    }
                }
            })
            .state('dashboard.userSettings', {
                url: '/user-settings',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/userSettings.html',
                        controller: 'userSettingsController'
                    }
                }
            })
            .state('dashboard.orgSettings', {
                url: '/organization-settings',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/orgSettings.html',
                        controller: 'orgSettingsController'
                    }
                }
            })
            .state('dashboard.sentPushMessages', {
                url: '/sent-push-messages',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/sent.html',
                        controller: 'sentController'
                    }
                }
            })
            .state('dashboard.AB_Testing', {
                url: '/create-ab-test',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/abTesting.html',
                        controller: 'abTestController'
                    }
                }
            })
            .state('dashboard.AB_SplitTesting', {
                url: '/ab-split-testing',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/showAbTest.html',
                        controller: 'showAbTestController'
                    }
                }
            })
            .state('dashboard.testDetails', {
                url: '/ab-test-details',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/abTestDetails.html',
                        controller: 'abTestDetailsController'
                    }
                }
            })
            .state('dashboard.plans', {
                url: '/plans',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/plans.html',
                        controller: 'plansController'
                    }
                }
            })
            .state('dashboard.userImpressions', {
                url: '/user-insight',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/userInsight.html',
                        controller: 'userInsightController'
                    }
                }
            })
            .state('dashboard.planUsage', {
                url: '/plan-usage',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/planUsage.html',
                        controller: 'planUsageController'
                    }
                }
            })
            .state('invitedUserLogin', {
                url: '/invited-user-login',
                resolve: {
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/invitedUserLogin.html',
                        controller: 'invitedUserLogin'
                    },
                    'headbar@invitedUserLogin': {
                        templateUrl: 'views/loginHeadbar.html'
                    },
                }

            })
            .state('deactivatedUser', {
                url: '/deactivated-user',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        return Auth.$requireSignIn();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/deactivatedUser.html',
                        controller: 'deactivatedUser'
                    },
                    // the child views will be defined here (absolutely named)
                    'headbar@deactivatedUser': {
                        templateUrl: 'views/deactivatedUserHeader.html',
                        controller: 'deactivatedUserHeadbarController'
                    }
                }
            })
            .state('prohiveAdminLogin', {
                url: '/prohive-admin-login',
                resolve: {
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    '': {
                        templateUrl: 'views/prohiveAdminLogin.html',
                        controller: 'admLoginController'
                    },
                    // the child views will be defined here (absolutely named)
                    'headbar@prohiveAdminLogin': {
                        templateUrl: 'views/loginHeadbar.html'
                    }
                }
            })
            .state('dashboard.impressionsUsers', {
                url: '/users-impression',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/impressions/users.impressions.html',
                        controller: 'usersImpressions'
                    },
                }
            })
            .state('dashboard.impressionsInstalls', {
                url: '/installs-impression',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/impressions/installs.impressions.html',
                        controller: 'installsImpressions'
                    },
                }
            })
            .state('dashboard.impressionsOverview', {
                url: '/overview-impression',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/impressions/overview.impressions.html',
                        controller: 'impressionsOverview'
                    },
                    // 'dateFilter@dashboard.impressionsOfflineViews':{
                    //     templateUrl :'views/dateFilter/dateFilter.html',
                    //     // controller:'dateFilter'
                    // }
                }
            })
            .state('dashboard.impressionsSubscribers', {
                url: '/subscribers-impression',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/impressions/subscribers.impressions.html',
                        controller: 'subscribersImpressions'
                    },
                    // 'dateFilter@dashboard.impressionsAppViews':{
                    //     templateUrl :'views/dateFilter/dateFilter.html',
                    //     // controller:'dateFilter'
                    // }
                }
            })
            .state('dashboard.impressionsSegments', {
                url: '/segments-impression',
                //templateUrl : 'views/plans.html',
                resolve: {
                    "currentAuth": ["Auth", "$state", function (Auth, $state) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                },
                views: {
                    // the main template will be placed here (relatively named)
                    '': {
                        templateUrl: 'views/impressions/segments.impressions.html',
                        controller: 'segmentsImpressions'
                    },
                }
            })
            .state('dashboard.rss', {
                url: '/rss',
                templateUrl: 'views/rss/rssToPush.html',
                controller: 'rssPushController',
                resolve: {
                    "currentAuth": ["Auth", function (Auth) {
                        if (Auth.$requireSignIn().uid !== null) {
                            return Auth.$requireSignIn();
                        } else {
                            $state.go('index');
                        }
                    }],
                    "load": ['getMessage', function (getMessage) {
                        return getMessage.LoadData();
                    }],
                    "currentState": ['getState', function (getState) {
                        return getState.LoadData();
                    }]
                }
            })
    }
]);

// subscriberImpressions