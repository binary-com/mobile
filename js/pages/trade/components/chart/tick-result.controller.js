/**
 * @name tick result controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 06/30/2018
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.chart.controllers").controller("TickResultController", TickResult);

    TickResult.$inject = ["$scope"];

    function TickResult($scope) {
        const vm = this;

        vm.spots = [];
        vm.reset = true;
        vm.counter = 0;
        vm.selectedTick = 0;

        $scope.$on("contract:spot", (e, contract, lastPrice) => {
            if (vm.reset) {
                vm.spots = new Array(contract.duration + 1);
                _.map(vm.spots, (val, i) => {
                    vm.spots[i] = {}
                });
                vm.reset = false;
                vm.counter = 0;
            }
            const localContract = _.clone(contract);

            $scope.$applyAsync(() => {
                vm.selectedTick = contract.selectedTick - 1;
                if (vm.counter < vm.spots.length) {
                    vm.spots[vm.counter++] = {
                        result: localContract.result,
                        value : lastPrice
                    };
                }
            });
        });

        $scope.$on("contract:finished", (e, contract) => {
            vm.reset = true;
        });
    }
})();
