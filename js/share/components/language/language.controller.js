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

    Language.$inject = ["$scope", "config", "languageService", "supportedLanguagesService", "websocketService", "appStateService"];

    function Language($scope, config, languageService, supportedLanguagesService, websocketService, appStateService) {
        const vm = this;
        vm.languages = [];
        vm.appSupportedLanguages = [];
        vm.languagesList = [];
        vm.isLanguageReady = false;
        vm.showSpinner = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        const init = () => {
            const supportedLanguages = supportedLanguagesService.supportedLanguages;
            vm.appSupportedLanguages = config.appSupportedLanguages;
            _.forEach(vm.appSupportedLanguages, value => {
                vm.value = value.toUpperCase();
                if (supportedLanguages.indexOf(vm.value) > -1) {
                    const LanguageCode = vm.value.toLowerCase();
                    const languageNativeName = languageService.getLanguageNativeName(LanguageCode);
                    vm.languages.push({
                        id   : LanguageCode,
                        title: languageNativeName
                    });
                }
            });

            if (vm.languages.length) {
                vm.isLanguageReady = true;
                appStateService.isLanguageReady = true;
            }
        };

        $scope.$on('authorize', (e, authorize) => {
            vm.showSpinner = false;
        });

        $scope.$on('supported_languages', init);

        vm.language = languageService.read();

        vm.changeLanguage = function(language) {
            vm.language = language || vm.language;
            languageService.update(vm.language);
            vm.showSpinner = true;
        };

        init();
    }
})();
