/**
 * @name settings controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 11/11/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.settings.controllers").controller("SettingsController", Settings);

    Settings.$inject = ["appStateService", "accountService", "clientService"];

    function Settings(appStateService, accountService, clientService) {
        const vm = this;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        vm.settings = [
            {
                name               : "profile.personal_details",
                url                : "profile",
                scope              : "read",
                forRealAccount     : false,
                forFinancialAccount: false
            },
            {
                name               : "settings.account_categorisation",
                url                : "account-categorisation",
                scope              : "read",
                forRealAccount     : false,
                forFinancialAccount: true
            },
            {
                name               : "settings.self_exclusion",
                url                : "self-exclusion",
                scope              : "admin",
                forRealAccount     : true,
                forFinancialAccount: false
            },
            {
                name               : "menu.language",
                url                : "language",
                scope              : "read",
                forRealAccount     : false,
                forFinancialAccount: false
            },
            {
                name               : "settings.change_password",
                url                : "change-password",
                scope              : "admin",
                forRealAccount     : false,
                forFinancialAccount: false
            },
            {
                name               : "settings.financial_assessment",
                url                : "financial-assessment",
                scope              : "admin",
                forRealAccount     : true,
                forFinancialAccount: false
            },
            {
                name               : "settings.limits",
                url                : "limits",
                scope              : "admin",
                forRealAccount     : true,
                forFinancialAccount: false
            }
        ];

        vm.checkAccount = forRealAccount =>
            forRealAccount ? !appStateService.virtuality : true;

        vm.checkFinancialAccount = forFinancialAccount => {
            const currentAccount = accountService.getDefault();
            const landingCompany = currentAccount ? currentAccount.landing_company_name : '';
            return forFinancialAccount ? isLandingCompanyOf('maltainvest', landingCompany) : true;
        };

    }
})();
