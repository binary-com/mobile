/**
 * @name selected tick controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 06/23/2018
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.controllers").controller("SelectedTickController", SelectedTick);

    SelectedTick.$inject = [];

    function SelectedTick() {
        const vm = this;

        vm.selectableTicksRange = [];

        vm.selectSelectedTick = selectedTick => {
            vm.select()(selectedTick);
        };

        const init = () => {
            if (!_.isEmpty(sessionStorage.tradeTypes)) {
                const tick = vm.tick ? parseInt(vm.tick) : 0;
                vm.selectableTicksRange = _.range(1, tick + 1);
            } else {
                setTimeout(init, 5);
            }
        }

        init();
    }
})();
