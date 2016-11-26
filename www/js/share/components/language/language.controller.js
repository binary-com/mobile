/**
 * @name language directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.language.controllers')
        .controller('LanguageController', Language);

    Language.$inject = ['$scope', 'languageService', 'websocketService', 'appStateService'];

    function Language($scope, languageService, websocketService, appStateService) {

        var vm = this;
        vm.languages = [];
        vm.isLanguageReady = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        websocketService.sendRequestFor.websiteStatus();
        $scope.$on('website_status', function(e, website_status) {
            vm.languagesList = website_status.supported_languages;
            _.forEach(vm.languagesList, function(value) {
                var LanguageCode = value.toLowerCase();
                var languageNativeName = languageService.getLanguageNativeName(LanguageCode);
                vm.languages.push({
                    'id': LanguageCode,
                    'title': languageNativeName
                });
            });
            vm.isLanguageReady =  true;
            appStateService.isLanguageReady = true;
            $scope.$apply();

        });

        vm.language = languageService.read();

        vm.changeLanguage = function(language) {
            vm.language = language || vm.language;
            languageService.update(vm.language);
        }
    }
})();
