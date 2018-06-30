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

        $scope.$on("contract:spot", (e, contract, lastPrice) => {
            console.log(contract.entrySpotPrice);
            if (vm.reset) {
                vm.spots = new Array(contract.duration + 1);
                for (let i = 0; i < vm.spots.length; i++) {
                    vm.spots[i] = {};
                }
                vm.reset = false;
                vm.counter = 0;
            }

            const localContract = _.clone(contract);

            $scope.$applyAsync(() => {
                vm.spots[vm.counter++] = {
                    result: localContract.result,
                    value : lastPrice.toString().slice(-1)
                };
            });
        });

        $scope.$on("contract:finished", (e, contract) => {
            vm.reset = true;
        });
    }
})();
