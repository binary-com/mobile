/**
 * @name MT5 Web Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 04/15/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.meta-trader.controllers").controller("MT5WebController", MTWeb);

    MTWeb.$inject = ["$sce", "$stateParams"];

    function MTWeb($sce, $stateParams) {
        const vm = this;
        vm.url = "https://trade.mql5.com/trade?servers=Binary.com-Server&trade_server=Binary.com-Server&login=";

        vm.url += $stateParams.id;

        vm.url = $sce.trustAsResourceUrl(vm.url);
    }
})();
