/**
 * @name ticks directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/26/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.controllers").controller("TicksController", Ticks);

    Ticks.$inject = [];

    function Ticks() {
        const vm = this;

        let min = 0;
        let max = 0;
        vm.tickRange = [];

        vm.selectTick = tick => {
            vm.select()(tick);
        };

        const getTickValue = tick => tick.slice(0, -1);

        const init = () => {
            if (!_.isEmpty(sessionStorage.tradeTypes)) {
                const tradeType = JSON.parse(sessionStorage.tradeTypes)[vm.tradeType][0];
                min = parseInt(getTickValue(tradeType.min_contract_duration));
                max = parseInt(getTickValue(tradeType.max_contract_duration));
                vm.tickRange = _.range(min, max + 1);
            } else {
                setTimeout(init, 5);
            }
        };

        init();
    }
})();
