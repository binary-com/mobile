/**
 * @name states.config
 * @author Massih Hazrati
 * @contributors []
 * @since 11/4/2015
 * @copyright Binary Ltd
 */

angular.module("binary").config(($locationProvider, $stateProvider, $urlRouterProvider, $ionicConfigProvider) => {
    $ionicConfigProvider.views.swipeBackEnabled(false);
    $stateProvider
        .state("home", {
            url        : "/",
            cache      : false,
            templateUrl: "js/pages/home/home.template.html",
            controller : "HomeController"
        })
        .state("layout", {
            cache      : false,
            templateUrl: "js/share/templates/layout/main-layout.template.html",
            abstract   : true
        })
        .state("trade", {
            parent      : "layout",
            cache       : false,
            controller  : "TradeController",
            controllerAs: "vm",
            templateUrl : "js/pages/trade/trade.template.html"
        })
        .state("signin", {
            params: {
                accountTokens   : null,
                verificationCode: null,
            },
            cache       : false,
            templateUrl : "js/pages/sign-in/sign-in.template.html",
            controller  : "SigninController",
            controllerAs: "vm"
        })
        .state("profit-table", {
            parent      : "layout",
            cache       : true,
            templateUrl : "js/pages/profit-table/profit-table.template.html",
            controller  : "ProfitTableController",
            controllerAs: "vm",
            detailed    : true
        })
        .state("statement", {
            parent      : "layout",
            cache       : true,
            templateUrl : "js/pages/statement/statement.template.html",
            controller  : "StatementController",
            controllerAs: "vm",
            detailed    : true
        })
        .state("transaction-detail", {
            parent        : "layout",
            cache         : false,
            templateUrl   : "js/pages/transaction-detail/transaction-detail.template.html",
            controller    : "TransactionDetailController",
            controllerAs  : "vm",
            reloadOnSearch: false
        })
        .state("real-account-opening", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/real-account-opening/real-account-opening.template.html",
            controller  : "RealAccountOpeningController",
            controllerAs: "vm"
        })
        .state("maltainvest-account-opening", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/maltainvest-account-opening/maltainvest-account-opening.template.html",
            controller  : "MaltainvestAccountOpeningController",
            controllerAs: "vm"
        })
        .state("language", {
            parent     : "layout",
            cache      : false,
            templateUrl: "js/pages/language/language.template.html"
        })
        .state("settings", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/settings/settings.template.html",
            controller  : "SettingsController",
            controllerAs: "vm",
            detailed    : true
        })
        .state("resources", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/resources/resources.template.html",
            controller  : "ResourcesController",
            controllerAs: "vm",
            detailed    : true
        })
        .state("self-exclusion", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/self-exclusion/self-exclusion.template.html",
            controller  : "SelfExclusionController",
            controllerAs: "vm"
        })
        .state("no-connection", {
            templateUrl: "js/share/components/connectivity/connectivity.template.html"
        })
        .state("profile", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/profile/profile.template.html",
            controller  : "ProfileController",
            controllerAs: "vm"
        })
        .state("terms-and-conditions", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/terms-and-conditions/terms-and-conditions.template.html",
            controller  : "TermsAndConditionsController",
            controllerAs: "vm"
        })
        .state("update", {
            url         : "/update",
            cache       : false,
            templateUrl : "js/pages/update/update.template.html",
            controller  : "UpdateController",
            controllerAs: "vm"
        })
        .state("change-password", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/change-password/change-password.template.html",
            controller  : "ChangePasswordController",
            controllerAs: "vm"
        })
        .state("financial-assessment", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/financial-assessment/financial-assessment.template.html",
            controller  : "FinancialAssessmentController",
            controllerAs: "vm"
        })
        .state("limits", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/limits/limits.template.html",
            controller  : "LimitsController",
            controllerAs: "vm"
        })
        .state("trading-times", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/trading-times/trading-times.template.html",
            controller  : "TradingTimesController",
            controllerAs: "vm"
        })
        .state("asset-index", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/asset-index/asset-index.template.html",
            controller  : "AssetIndexController",
            controllerAs: "vm"
        })
        .state("meta-trader", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/meta-trader/meta-trader.template.html",
            controller  : "MetaTraderController",
            controllerAs: "vm"
        })
        .state("mt5-web", {
            parent: "layout",
            params: {
                id: null
            },
            cache       : false,
            templateUrl : "js/pages/meta-trader/mt5-web.template.html",
            controller  : "MT5WebController",
            controllerAs: "vm"
        })
        .state("outage", {
            params: {
                message: null
            },
            controller  : "ServiceOutagePageController",
            controllerAs: "vm",
            templateUrl : "js/share/components/service-outage/service-outage.template.html"
        })
        .state("authentication", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/authentication/authentication.template.html",
            controller  : "AuthenticationController",
            controllerAs: "vm",
            detailed    : true
        })
        .state("contact", {
            parent      : "layout",
            cache       : true,
            templateUrl : "js/pages/contact/contact.template.html",
            controller  : "ContactController",
            controllerAs: "vm"
        })
        .state("notifications", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/notifications/notifications.template.html",
            controller  : "NotificationsController",
            controllerAs: "vm",
            detailed    : true
        })
        .state("set-currency", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/set-currency/set-currency.template.html",
            controller  : "SetCurrencyController",
            controllerAs: "vm"
        })
        .state("accounts-management", {
            parent      : "layout",
            cache       : false,
            templateUrl : "js/pages/accounts-management/accounts-management.template.html",
            controller  : "AccountsManagementController",
            controllerAs: "vm"
        })
        .state('redirect', {
            url         : "/redirect",
            cache       : "false",
            templateUrl : "js/pages/redirect/redirect.template.html",
            controller  : "RedirectController",
            controllerAs: "vm"
        })
        .state('account-categorisation', {
            parent      : "layout",
            cache       : "false",
            templateUrl : "js/pages/account-categorisation/account-categorisation.template.html",
            controller  : "AccountCategorisationController",
            controllerAs: "vm"
        });


    $urlRouterProvider.otherwise("/");

    const baseElement = document.getElementsByTagName('base');

    if(baseElement.length) {
        $locationProvider.html5Mode(true);
    }
});
