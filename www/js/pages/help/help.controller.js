/**
 * @name help module
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.pages.help.controllers").controller("HelpController", Help);

    Help.$inject = ["$state", "analyticsService", "languageService"];

    function Help($state, analyticsService, languageService) {
        const vm = this;
        const language = languageService.read();
        vm.tokenUrl = `https://www.binary.com/${language.toLowerCase()}/user/settings/api_tokenws.html`;

        analyticsService.google.trackView("Help");

        vm.backToSignInPage = () => {
            $state.go("signin");
        };

        vm.openExternal = $event => {
            window.open($event.currentTarget.href, "_system");
            return false;
        };
    }
})();
