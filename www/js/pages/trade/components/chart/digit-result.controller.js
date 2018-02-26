/**
 * @name digit-result controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/01/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.chart.controllers").controller("DigitResultController", Result);

    Result.$inject = ["$scope"];

    function Result($scope) {
        const vm = this;

        vm.spots = [];
        vm.reset = true;
        vm.counter = 0;

        $scope.$on("contract:spot", (e, contract, lastPrice) => {
            if (vm.reset) {
                // vm.spots = new Array(contract.duration+1).fill().map((e, i) => { return {}});
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
