/**
 * @name update controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/26/2015
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.update.controllers").controller("UpdateController", Update);

    Update.$inject = ["$http", "$scope", "languageService"];

    function Update($http, $scope, languageService) {
        const vm = this;
        vm.storeLogo = null;
        vm.lastVersion = null;
        vm.showSpinner = true;
        vm.platform = null;

        vm.openExternal = function(url) {
            window.open(url, "_system");
            return false;
        };

        init();

        function init() {
            getVersions();
        }

        function getVersions() {
            $http({
                method: "GET",
                url   : "versions.json"
            }).then(
                response => {
                    if (response.data) {
                        $scope.$applyAsync(() => {
                            vm.showSpinner = false;
                            const versions = response.data;
                            vm.lastVersion = versions.pop();
                            generateStoreLogo();
                        });
                    }
                },
                error => {
                    vm.versions = null;
                }
            );
        }

        function generateStoreLogo() {
            const language = languageService.read();
            vm.platform = "appstore";
            if (ionic.Platform.isAndroid()) {
                vm.platform = "googleplay";
            }
            vm.storeLogo = `img/${vm.platform}/${language}.svg`;
        }
    }
})();
