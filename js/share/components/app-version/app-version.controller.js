/**
		 * @name app version controller
		 * @author Nazanin Reihani Haghighi
		 * @contributors []
		 * @since 12/19/2016
		 * @copyright Binary Ltd
		 */

(function() {
    angular.module("binary.share.components.app-version.controllers").controller("AppVersionController", AppVersion);

    AppVersion.$inject = ["$scope", "$ionicPlatform", "appVersionService"];

    function AppVersion($scope, $ionicPlatform, appVersionService) {
        const vm = this;
        vm.appVersion = '0.0.0';
        $ionicPlatform.ready(() => {
            $scope.$applyAsync(() => {
                if (window.cordova) {
                    cordova.getAppVersion(
                        version => {
                            vm.appVersion = version;
                            window._trackJs.version = vm.appVersion;
                        },
                        err => {
                            // console.log(err);
                        }
                    );
                } else {
                    appVersionService
                        .getAppVersion()
                        .success(data => {
                            vm.appVersion = data.version;
                            window._trackJs.version = vm.appVersion;
                        })
                        .error(data => {
                            vm.appVersion = "0.0.0";
                            window._trackJs.version = vm.appVersion;
                        });
                }
            });
        });
    }
})();
