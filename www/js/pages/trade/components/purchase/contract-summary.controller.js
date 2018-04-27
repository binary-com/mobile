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

    Summary.$inject = ['appStateService'];

    function Summary(appStateService) {
        const vm = this;
        vm.currencyType = 'fiat';
        const currency = sessionStorage.getItem('currency');
        const currencyConfig = appStateService.currenciesConfig[currency];

        if (currencyConfig) {
            vm.currencyType = currencyConfig.type;
        }
    }
})();
