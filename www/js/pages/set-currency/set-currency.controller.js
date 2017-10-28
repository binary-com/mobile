/**
 * @name set-currency controller
 * @author Nazanin Reihani haghighi
 * @contributors []
 * @since 10/18/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.set-currency.controllers").controller("SetCurrencyController", SetCurrency);

    SetCurrency.$inject = ['$scope',
        '$rootScope',
        '$state',
        'config',
        'appStateService',
        'websocketService',
        'localStorageService',
        'accountService'];

    function SetCurrency($scope,
        $rootScope,
        $state,
        config,
        appStateService,
        websocketService,
        localStorageService,
        accountService) {
        const vm = this;
        const cryptoConfig = config.cryptoConfig;
        const currencyConfig = appStateService.currenciesConfig;
        const payoutCurrencies = appStateService.payoutCurrencies;
        const accounts = accountService.getAll();
        const currentAccount = accountService.getDefault();
        vm.currenciesOptions = [];



        vm.getCurrenciesOptions = () => {






            // payoutCurrencies.forEach(curr => {
            //     const	currency = currencyConfig[curr];
            //     const isCryptoCurrency = /crypto/i.test(currencyConfig[curr].type);
            //     currency.symb = curr;
            //     currency.isCryptoCurrency = isCryptoCurrency;
            //     currency.img = `/img/currency/${curr.toLowerCase()}.svg`;
            //     if (isCryptoCurrency) {
            //         currency.name = cryptoConfig[curr].name;
            //     }
            //     vm.currenciesOptions.push(currencyConfig[curr]);
            // });
            // return vm.currenciesOptions;
        };

        const hasCurrency = (options) => {
            $scope.$applyAsync(() => {
                vm.hasCrypto = _.findIndex(options, 'isCryptoCurrency') > -1;
                vm.hasFiat = _.findIndex(options, ['isCryptoCurrency', false]) > -1;
            });
        };

        vm.setCurrencyOfAccount = (selectedCurrency) => {
            websocketService.sendRequestFor.setAccountCurrency(selectedCurrency);
        }

        $scope.$on('set_account_currency:success', (e, currency) => {
            const accounts = JSON.parse(localStorage.accounts);
            for (let i = 0; i < accounts.length; i++) {
                if (accounts[i].is_default === true){
                    accounts[i].currency = currency;
                    break;
                }
            }
            localStorage.setItem("accounts", JSON.stringify(accounts));
            appStateService.accountCurrencyChanged = true;
            $rootScope.$broadcast("currency:changed", currency);
            $state.go("trade");
        });

        async function init () {
            const options = await vm.getCurrenciesOptions();
            hasCurrency(options);
        };

        init();
    }
})();
