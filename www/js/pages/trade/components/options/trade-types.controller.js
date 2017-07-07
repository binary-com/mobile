/**
 * @name trayeTypes directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/24/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.controllers").controller("TradeTypesController", TradeTypes);

    TradeTypes.$inject = [];

    function TradeTypes() {
        const vm = this;

        vm.tradeTypes = {};

        vm.selectTradeType = function(tradeType) {
            vm.select()(tradeType);
        };

        function init() {
            vm.tradeTypes = JSON.parse(sessionStorage.tradeTypes);
        }

        init();
    }
})();
