/**
 * @name select currency controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/18/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.select-currency.controllers").controller("SelectCurrencyController", SelectCurrency);

    SelectCurrency.$inject = ['$scope', '$rootScope', '$state', '$translate', 'appStateService', 'websocketService', 'localStorageService', ];

    function SelectCurrency($scope,
        $rootScope,
        $state,
        $translate,
        appStateService,
        websocketService,
        localStorageService) {
        const vm = this;
        vm.currenciesOptions = [];
        const currencyConfig = appStateService.currenciesConfig;
        const payoutCurrencies = appStateService.payoutCurrencies;
        vm.cryptoConfig = {
            BTC: { name: 'bitcoin' },
            BCH: { name: 'bitcoin_cash' },
            ETH: { name: 'ether' },
            ETC: { name: 'ether_classic' },
            LTC: { name: 'litecoin' },
        };

        vm.getCurrenciesOptions = () => {
            payoutCurrencies.forEach(curr => {
                const	currency = currencyConfig[curr];
                const isCryptoCurrency = /crypto/i.test(currencyConfig[curr].type);
                currency.symb = curr;
                currency.isCryptoCurrency = isCryptoCurrency;
                currency.img = `../../../img/currency/${curr.toLowerCase()}.svg`;
                if (isCryptoCurrency) {
                    currency.name = vm.cryptoConfig[curr].name;
                }
                vm.currenciesOptions.push(currencyConfig[curr]);
            });
            return vm.currenciesOptions;
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
