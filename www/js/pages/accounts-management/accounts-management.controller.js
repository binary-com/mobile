/**
 * @name Accounts management controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/28/2017
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.pages.accounts-management.controllers")
        .controller("AccountsManagementController", AccountsManagement);

    AccountsManagement.$inject = [
        "$scope",
        "$state",
        "appStateService",
        "accountService",
        "currencyService"
    ];

    function AccountsManagement($scope, $state, appStateService, accountService, currencyService) {
        const vm = this;
        vm.isMultiAccountOpening = appStateService.isMultiAccountOpening;
        vm.isNewAccountMaltainvest = appStateService.isNewAccountMaltainvest;
        vm.isNewAccountReal = appStateService.isNewAccountReal;
        vm.accounts = accountService.getAll();
        vm.currentAccount = accountService.getDefault();

        vm.accountType = id => currencyService.getAccountType(id);
        vm.getAvailableMarkets = (id) => {
            let availableMarketsArray = currencyService.getLandingCompanyProperty(id, 'legal_allowed_markets');
            if (Array.isArray(availableMarketsArray) && availableMarketsArray.length) {
                availableMarkets = _.join(availableMarketsArray, ', ');
            }
            return availableMarkets;
        }

    }
})();
