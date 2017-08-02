/**
 * @name updater module
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/20/2015
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.updater.controllers").controller("UpdaterController", Updater);

    Updater.$inject = ["$ionicPlatform"];

    function Updater($ionicPlatform) {
        $ionicPlatform.ready(() => {
            if (window.codePush) {
                window.codePush.sync();
            }
        });
    }
})();
