/**
 * @name language directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.share.components.language.controllers").controller("LanguageController", Language);

    Language.$inject = ["$scope", "config", "languageService", "websocketService", "appStateService"];

    function Language($scope, config, languageService, websocketService, appStateService) {
        const vm = this;
        vm.languages = [];
        vm.appSupportedLanguages = [];
        vm.languagesList = [];
        vm.isLanguageReady = false;
        vm.showSpinner = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        websocketService.sendRequestFor.websiteStatus(true);
        $scope.$on("website_status", (e, website_status) => {
            if (!vm.isLanguageReady && website_status) {
                vm.languages = [];
                vm.languagesList = website_status.supported_languages;
                vm.appSupportedLanguages = config.appSupportedLanguages;
                _.forEach(vm.appSupportedLanguages, value => {
                    vm.value = value.toUpperCase();
                    if (vm.languagesList.indexOf(vm.value) > -1) {
                        const LanguageCode = vm.value.toLowerCase();
                        const languageNativeName = languageService.getLanguageNativeName(LanguageCode);
                        vm.languages.push({
                            id   : LanguageCode,
                            title: languageNativeName
                        });
                    }
                });
                vm.isLanguageReady = true;
                appStateService.isLanguageReady = true;
                $scope.$apply();
            }
            if (!vm.isLanguageReady && !website_status) {
                vm.languages = [];
                vm.languages.push({
                    id   : "en",
                    title: "English"
                });
                vm.isLanguageReady = true;
                appStateService.isLanguageReady = true;
                $scope.$apply();
            }
        });

        $scope.$on('authorize', (e, authorize) => {
            vm.showSpinner = false;
        });

        vm.language = languageService.read();

        vm.changeLanguage = function(language) {
            vm.language = language || vm.language;
            languageService.update(vm.language);
            vm.showSpinner = true;
        };
    }
})();
