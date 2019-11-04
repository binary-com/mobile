/**
 * @name contract-summary controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 09/07/2016
 * @copyright binary ltd
 */

(function() {
    angular
        .module("binary.pages.trade.components.purchase.controllers")
        .controller("ContractSummaryController", Summary);

    Summary.$inject = ['$scope', 'appStateService'];

    function Summary($scope, appStateService) {
        const vm = this;
        vm.currencyType = 'fiat';
        let currency = sessionStorage.getItem('currency');
        let currencyConfig = appStateService.currenciesConfig[currency];

        if (currencyConfig) {
            vm.currencyType = currencyConfig.type;
        }

        $scope.$watch(
            () => vm.proposal,
            () => {
                currency = sessionStorage.getItem('currency');
                currencyConfig = appStateService.currenciesConfig[currency];
                if (currencyConfig) {
                    vm.currencyType = currencyConfig.type;
                }
            }
        );
    }
})();
