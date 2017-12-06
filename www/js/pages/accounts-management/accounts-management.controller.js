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
        "$timeout",
        "$translate",
        "appStateService",
        "accountService",
        "clientService"
    ];

    function AccountsManagement($scope,
        $state,
        $timeout,
        $translate,
        appStateService,
        accountService,
        clientService) {
        const vm = this;
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


        const isCryptocurrency = (currencyConfig, curr) => /crypto/i.test(currencyConfig[curr].type);

        const getNextAccountTitle = (typeOfNextAccount) => {
            let nextAccount;
            if (typeOfNextAccount === 'real') {
                nextAccount = $translate.instant('accounts-management.account_real');
            } else if (typeOfNextAccount === 'financial') {
                nextAccount = $translate.instant('accounts-management.account_financial');
            }
            return nextAccount;
        };

        const getCurrenciesForNewAccount = (currencies) => {
            const currencyConfig = appStateService.currenciesConfig;
            const currenciesLength = currencies.length;
            const currencyOptions = [];
            for (let i = 0; i < currenciesLength; i++ ) {
                const currencyObject = {};
                const curr = currencies[i];
                currencyObject.name = curr;
                // adding translate labels to currencies
                currencyObject.currencyGroup = isCryptocurrency(currencyConfig, curr) ?
                    $translate.instant('accounts-management.crypto_currencies') :
                    $translate.instant('accounts-management.fiat_currencies');
                currencyOptions.push(currencyObject);
            }
            return currencyOptions;
        }

        const accountType = id => clientService.getAccountType(id);

        const getAvailableMarkets = (id) => {
            const legalAllowedMarkets = clientService.landingCompanyValue(id, 'legal_allowed_markets');
            let availableMarkets = [];
            if (Array.isArray(legalAllowedMarkets) && legalAllowedMarkets.length) {
                availableMarkets = _.join(filterMarkets(legalAllowedMarkets), ', ');
            }
            return availableMarkets;
        };

        const getExistingAccounts = () => {
            const existingAccounts = [];
            _.forEach(vm.accounts, (acc) => {
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

        const getAvailableAccounts = () => {
            vm.upgrade = appStateService.upgrade;
            if (vm.upgrade.canUpgrade) {
                vm.legalAllowedMarkets = _.join(filterMarkets(vm.upgrade.allowedMarkets), ', ');
                vm.titleOfNextAccount = getNextAccountTitle(vm.upgrade.typeOfNextAccount);
                vm.newAccountCurrencyOptions = getCurrenciesForNewAccount(vm.upgrade.currencyOptions);
                if (vm.newAccountCurrencyOptions.length) {
                    vm.selectedCurrency = vm.newAccountCurrencyOptions[0].name;
                }
            }
        };

        const init = () => {
            vm.accounts = accountService.getAll();
            vm.currentAccount = accountService.getDefault();
            vm.selectCurrencyError = false;
            getAvailableAccounts();
            vm.existingAccounts = getExistingAccounts();
        };

        vm.redirectToSetCurrency = () => {
            $state.go('set-currency');
        };

        vm.redirectToAccountOpening = () => {
            if (vm.currentAccount.currency && vm.currentAccount.currency !== '') {
                appStateService.selectedCurrency = vm.selectedCurrency;
                appStateService.redirectedFromAccountsManagemenet = true;
                if (vm.upgrade.typeOfNextAccount === 'real') {
                    $state.go('real-account-opening');
                } else if (vm.upgrade.typeOfNextAccount === 'financial') {
                    $state.go('maltainvest-account-opening');
                }
            } else {
                vm.selectCurrencyError = true;
            }
        };

        const reInitAfterChangeAccount = () => {
            if (appStateService.checkingUpgradeDone) {
                init();
            } else {
                $timeout(reInitAfterChangeAccount, 500);
            }
        }

        $scope.$on('authorize', (e, authorize) => {
            if (vm.currentAccount.id !== authorize.loginid) {
                reInitAfterChangeAccount();
            }
        });

        init();

    }
})();
