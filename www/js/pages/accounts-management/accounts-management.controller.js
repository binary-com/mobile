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
        "$translate",
        "appStateService",
        "accountService",
        "currencyService"
    ];

    function AccountsManagement($scope, $state, $translate, appStateService, accountService, currencyService) {
        const vm = this;
        vm.selectCurrencyError = false;
        vm.isMultiAccountOpening = appStateService.isMultiAccountOpening;
        vm.isNewAccountMaltainvest = appStateService.isNewAccountMaltainvest;
        vm.isNewAccountReal = appStateService.isNewAccountReal;
        vm.currencyOptions = appStateService.currencyOptions;
        const accounts = accountService.getAll();
        vm.currentAccount = accountService.getDefault();
        const activeMarkets = {
            commodities: $translate.instant('accounts-management.commodities'),
            forex      : $translate.instant('accounts-management.forex'),
            indices    : $translate.instant('accounts-management.indices'),
            stocks     : $translate.instant('accounts-management.stocks'),
            volidx     : $translate.instant('accounts-management.volidx')
        };

        const filterMarkets = (markets) => {
            const availableMarkets = [];
            _.forEach(markets, (market) => {
                if (market in activeMarkets && _.indexOf(availableMarkets, activeMarkets[market]) < 0) {
                    availableMarkets.push(activeMarkets[market]);
                }
            });
            return availableMarkets;
        };
        // legal allowed markets for new account
        vm.legalAllowedMarkets = _.join(filterMarkets(appStateService.legalAllowedMarkets), ', ');

        const isCryptocurrency = (currencyConfig, curr) => /crypto/i.test(currencyConfig[curr].type);

        const getNextAccountType = () => {
            let nextAccount;
            if (vm.isMultiAccountOpening || vm.isNewAccountReal) {
                nextAccount = $translate.instant('accounts-management.account_real');
            } else if (vm.isNewAccountMaltainvest) {
                nextAccount = $translate.instant('accounts-management.account_financial');
            }
            return nextAccount;
        };

        const getCurrenciesForNewAccount = () => {
            const currencyConfig = appStateService.currenciesConfig;
            const currenciesLength = vm.currencyOptions.length;
            const currencyOptions = [];
            for (let i = 0; i < currenciesLength; i++ ) {
                const currencyObject = {};
                const curr = vm.currencyOptions[i];
                currencyObject.name = curr;
                // adding translate labels to currencies
                currencyObject.currencyGroup = /crypto/i.test(currencyConfig[curr].type) ?
                    $translate.instant('accounts-management.crypto_currencies') :
                    $translate.instant('accounts-management.fiat_currencies');
                currencyOptions.push(currencyObject);
            }
            return currencyOptions;
        }

        const accountType = id => currencyService.getAccountType(id);

        const getAvailableMarkets = (id) => {
            const legalAllowedMarkets = currencyService.landingCompanyValue(id, 'legal_allowed_markets');
            let availableMarkets = [];
            if (Array.isArray(legalAllowedMarkets) && legalAllowedMarkets.length) {
                availableMarkets = _.join(filterMarkets(legalAllowedMarkets), ', ');
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
            if (vm.newAccountCurrencyOptions.length) {
                vm.selectedCurrency = vm.newAccountCurrencyOptions[0].name;
            }
            vm.existingAccounts = getExistingAccounts();
        };


        vm.redirectToSetCurrency = () => {
            $state.go('set-currency');
        };

        vm.redirectToAccountOpening = () => {
            if (vm.currentAccount.currency && vm.currentAccount.currency !== '') {
                appStateService.selectedCurrency = vm.selectedCurrency;
                if (vm.isMultiAccountOpening || vm.isNewAccountReal) {
                    $state.go('real-account-opening');
                } else if (vm.isNewAccountMaltainvest) {
                    $state.go('maltainvest-account-opening');
                }
            } else {
                vm.selectCurrencyError = true;
            }
        };

        $scope.$on('authorize', (e, authorize) => {
            if (vm.currentAccount.id !== authorize.loginid) {
                $state.go('trade');
            }
        });

        init();

    }
})();
