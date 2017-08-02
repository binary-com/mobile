/**
 * @name underlyings controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/25/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.controllers").controller("UnderlyingsController", Underlying);

    Underlying.$inject = [];

    function Underlying() {
        const vm = this;
        vm.underlyings = [];

        vm.selectUnderlying = function(underlying) {
            vm.select()(underlying);
        };

        function init() {
            vm.underlyings = vm.market.underlying;
        }

        init();
    }
})();
