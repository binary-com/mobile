/**
 * @name resources controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/24/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.resources.controllers").controller("ResourcesController", Resources);

    Resources.$inject = [];

    function Resources() {
        const vm = this;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        vm.resources = [
            {
                name: "resources.trading_times",
                url : "trading-times"
            },
            {
                name: "resources.asset_index",
                url : "asset-index"
            }
        ];
    }
})();
