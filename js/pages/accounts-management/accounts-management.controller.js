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
        "$filter",
        "$timeout",
        "$translate",
        "appStateService",
        "accountService",
        "clientService",
        "websocketService",
        "alertService"
    ];

    function AccountsManagement($scope,
        $state,
        $filter,
        $timeout,
        $translate,
        appStateService,
        accountService,
        clientService,
        websocketService,
        alertService) {
        const vm = this;
        let hasRealAccount = false;
        let upgradingRealAccountDirectly = false;
        vm.upgradeButtonDisabled = false;
        const activeMarkets = {
            commodities: $translate.instant('accounts-management.commodities'),
            forex      : $translate.instant('accounts-management.forex'),
            indices    : $translate.instant('accounts-management.indices'),
            stocks     : $translate.instant('accounts-management.stocks'),
            volidx     : $translate.instant('accounts-management.volidx')
        };

        const requiredDirectUpgradeFields = [
            'salutation',
            'first_name',
            'last_name',
            'date_of_birth',
            'residence',
            'place_of_birth',
            'address_line_1',
            'address_city',
            'phone',
            'account_opening_reason'
        ];

        const directUpgradeData = {
            salutation            : '',
            first_name            : '',
            last_name             : '',
            date_of_birth         : '',
            place_of_birth        : '',
            residence             : '',
            address_line_1        : '',
            address_line_2        : '',
            address_city          : '',
            address_state         : '',
            address_postcode      : '',
            phone                 : '',
            account_opening_reason: ''
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

        const accountType = (landingCompany) => clientService.getAccountType(landingCompany);

        const getAvailableMarkets = (landingCompany) => {
            const legalAllowedMarkets = clientService.landingCompanyValue(landingCompany, 'legal_allowed_markets');
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
                account.isDisabled = acc.is_disabled;
                account.excludedUntil = acc.excluded_until ?
                    $filter('date')(acc.excluded_until *1000, 'yyyy-MM-dd HH:mm:ss') : false;
                account.availableMarkets = getAvailableMarkets(acc.landing_company_name);
                account.type = accountType(acc.landing_company_name);
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
            const landingCompany = vm.currentAccount.landing_company_name;
            vm.isMultiAccount = clientService.isLandingCompanyOf('costarica', landingCompany) || clientService.isLandingCompanyOf('svg', landingCompany);
            vm.selectCurrencyError = false;
            getAvailableAccounts();
            vm.existingAccounts = getExistingAccounts();
            hasRealAccount = !!_.find(vm.existingAccounts, acc => acc.type === 'real');
            vm.showContact = _.some(vm.existingAccounts, acc => acc.isDisabled || acc.excludedUntil);
        };

        vm.redirectToSetCurrency = () => {
            $state.go('set-currency');
        };

        vm.openNewAccount = () => {
            if (((vm.currentAccount.currency && vm.currentAccount.currency !== '') || !vm.upgrade.multi)
                && !vm.upgradeButtonDisabled) {
                vm.upgradeButtonDisabled = true;
                appStateService.selectedCurrency = vm.selectedCurrency;
                appStateService.redirectedFromAccountsManagemenet = true;
                if (vm.upgrade.typeOfNextAccount === 'real') {
                    if (hasRealAccount) {
                        upgradingRealAccountDirectly = true;
                        websocketService.sendRequestFor.accountSetting();
                    } else {
                        $state.go('real-account-opening');
                    }
                } else if (vm.upgrade.typeOfNextAccount === 'financial') {
                    $state.go('maltainvest-account-opening');
                }
            } else {
                $scope.$applyAsync(() => {
                    vm.upgradeButtonDisabled = false;
                    vm.selectCurrencyError = true;
                });
            }
        };

        $scope.$on("get_settings", (e, get_settings) => {
            if (upgradingRealAccountDirectly && get_settings) {
                _.forEach(directUpgradeData, (val, k) => {
                    if (get_settings[k]) directUpgradeData[k] = get_settings[k];
                });
                directUpgradeData.residence = get_settings.country_code;
                directUpgradeData.date_of_birth = get_settings.date_of_birth ?
                    $filter("date")(get_settings.date_of_birth * 1000, "yyyy-MM-dd") : '';
                directUpgradeData.currency = vm.selectedCurrency;
                // Some users have upgraded their account before the place_of_birth became required for real_account_opening
                // redirect these users to upgrade page to fill the form with place_of_birth included
                if (_.findIndex(requiredDirectUpgradeFields, field => !directUpgradeData[field]) > -1) {
                    $state.go('profile');
                } else {
                    websocketService.sendRequestFor.createRealAccountSend(directUpgradeData);
                }
            }
        });

        $scope.$on("new_account_real:error", (e, error) => {
            vm.upgradeButtonDisabled = false;
            if (error.hasOwnProperty("details")) {
                alertService.displayError(error.details);
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on("new_account_real", (e, new_account_real) => {
            const selectedAccount = new_account_real.oauth_token;
            websocketService.authenticate(selectedAccount);
            appStateService.newAccountAdded = true;
            accountService.addedAccount = selectedAccount;
            vm.upgradeButtonDisabled = false;
        });

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
