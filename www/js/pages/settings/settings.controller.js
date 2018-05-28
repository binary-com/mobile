/**
 * @name settings controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 11/11/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.settings.controllers").controller("SettingsController", Settings);

    Settings.$inject = ["appStateService"];

    function Settings(appStateService) {
        const vm = this;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        vm.settings = [
            {
                name          : "profile.personal_details",
                url           : "profile",
                scope         : "read",
                forRealAccount: false
            },
            {
                name          : "settings.self_exclusion",
                url           : "self-exclusion",
                scope         : "admin",
                forRealAccount: true
            },
            {
                name          : "menu.language",
                url           : "language",
                scope         : "read",
                forRealAccount: false
            },
            {
                name          : "settings.change_password",
                url           : "change-password",
                scope         : "admin",
                forRealAccount: false
            },
            {
                name          : "settings.financial_assessment",
                url           : "financial-assessment",
                scope         : "admin",
                forRealAccount: true
            },
            {
                name          : "settings.limits",
                url           : "limits",
                scope         : "admin",
                forRealAccount: true
            }
        ];

        vm.checkAccount = forRealAccount =>
            forRealAccount ? !appStateService.virtuality : true;
    }
})();
