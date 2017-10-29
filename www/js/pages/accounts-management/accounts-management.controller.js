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
        vm.currencyOptions = appStateService.currencyOptions;
        vm.legalAllowedMarkets = _.join(appStateService.legalAllowedMarkets, ', ');
        const accounts = accountService.getAll();
        vm.currentAccount = accountService.getDefault();

        const isCryptocurrency = (currencyConfig, curr) => /crypto/i.test(currencyConfig[curr].type);

        const getNextAccountType = () => {
            let nextAccount;
            if (vm.isMultiAccountOpening || vm.isNewAccountReal) {
                nextAccount = 'real';
            } else if (isNewAccountMaltainvest) {
                nextAccount = 'financial';
            }
            return nextAccount;
        };

        const getCurrenciesForNewAccount = () => {
            const currencyConfig = appStateService.currenciesConfig;
            const currenciesLength = vm.currencyOptions.length;
            const currencyOptions = [];
            for (var i = 0; i < currenciesLength; i++ ) {
                let currencyObject = {};
                const curr = vm.currencyOptions[i];
                currencyObject.name = curr;
                // adding translate labels to currencies
                currencyObject.currencyGroup = /crypto/i.test(currencyConfig[curr].type) ?
                    'accounts-management.crypto_currencies' :
                    'accounts-management.fiat_currencies';
                currencyOptions.push(currencyObject);
            }
            return currencyOptions;
        }

        const accountType = id => currencyService.getAccountType(id);
        const getAvailableMarkets = (id) => {
            let availableMarkets = currencyService.landingCompanyValue(id, 'legal_allowed_markets');
            if (Array.isArray(availableMarkets) && availableMarkets.length) {
                availableMarkets = _.join(availableMarkets, ', ');
            }
            return availableMarkets;
        };

        const getCurrenciesOptions = () => {
            const legalAllowedCurrencies = currencyService.landingCompanyValue(vm.currentAccount.id, 'legal_allowed_currencies');
            if (vm.currentAccount.id.startsWith('CR')) {
                const existingCurrencies = currencyService.getExistingCurrencies(accounts);
                if (existingCurrencies.length) {
                    const dividedExistingCurrencies = currencyService.dividedCurrencies(existingCurrencies);
                    const hasFiat = dividedExistingCurrencies.fiatCurrencies.length > 0;
                    if (hasFiat) {
                        const legalAllowedCryptoCurrencies =
                            currencyService.dividedCurrencies(legalAllowedCurrencies).cryptoCurrencies;
                        const existingCryptoCurrencies = dividedExistingCurrencies.cryptoCurrencies;
                        return _.difference(legalAllowedCryptoCurrencies, existingCryptoCurrencies);
                    }
                    return _.difference(legalAllowedCurrencies, existingCurrencies);
                }
                return legalAllowedCurrencies;
            }
            // for all accounts except CR accounts
            return legalAllowedCurrencies;
        };

        const getExistingAccounts = () => {
            const existingAccounts = [];
            _.forEach(accounts, (acc) => {
                const account = {};
                account.id = acc.id;
                account.availableMarkets = getAvailableMarkets(account.id);
                account.type = accountType(account.id);
                if (vm.currentAccount.id !== account.id) {
                    account.currency = acc.currency || '-';
                } else {
                    account.currency = acc.currency;
                }
                existingAccounts.push(account);
            });
            return existingAccounts;
        };

        const init = () => {
            vm.typeOfNextAccount = getNextAccountType();
            vm.newAccountCurrencyOptions = getCurrenciesForNewAccount();
            vm.selectedCurrency = vm.newAccountCurrencyOptions[0].name;
            vm.existingAccounts = getExistingAccounts();
        };


        vm.redirectToSetCurrency = () => {
            $state.go('set-currency');
        };

        init();

    }
})();
