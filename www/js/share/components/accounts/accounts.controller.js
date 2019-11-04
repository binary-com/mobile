/**
 * @name accounts controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.accounts.controllers").controller("AccountsController", Accounts);

    Accounts.$inject = [
        "$scope",
        "$rootScope",
        "$state",
        "$ionicSideMenuDelegate",
        "accountService",
        "appStateService",
        "websocketService",
        "notificationService",
        "validationService"
    ];

    function Accounts(
        $scope,
        $rootScope,
        $state,
        $ionicSideMenuDelegate,
        accountService,
        appStateService,
        websocketService,
        notificationService,
        validationService
    ) {
        const vm = this;
        let updatingAccount = false;

        const init = function() {
            vm.accounts = accountService.getAll();
            const defaultAccount = accountService.getDefault();
            if (defaultAccount == null) {
                vm.selectedAccount = null;
            } else {
                vm.selectedAccount = accountService.getDefault().token;
            }
        };

        $scope.$watch(
            () => appStateService.accountCurrencyChanged,
            () => {
                if (appStateService.accountCurrencyChanged === true) {
                    vm.accounts = accountService.getAll();
                    appStateService.accountCurrencyChanged = false;
                }
            }
        );

        const updateSymbols = function() {
            // Wait untile the login progress is finished
            if (!appStateService.isLoggedin) {
                setTimeout(updateSymbols, 500);
            } else {
                websocketService.sendRequestFor.symbols();
                websocketService.sendRequestFor.assetIndex();
            }
        };

        init();

        vm.updateAccount = function(_selectedAccount) {
            updatingAccount = true;
            appStateService.loginFinished = false;
            accountService.setDefault(_selectedAccount);
            accountService.validate();
            updateSymbols();
            websocketService.sendRequestFor.forgetStream(appStateService.balanceSubscribtionId);
            appStateService.isChangedAccount = true;
            sessionStorage.removeItem("start");
            sessionStorage.removeItem("_interval");
            sessionStorage.removeItem("realityCheckStart");
            appStateService.isProfitTableSet = false;
            appStateService.isStatementSet = false;
            appStateService.profitTableRefresh = true;
            appStateService.statementRefresh = true;
            sessionStorage.removeItem("countryParams");
            appStateService.isPopupOpen = false;
            appStateService.realityCheckLogin = false;
            $ionicSideMenuDelegate.toggleLeft();
            appStateService.limitsChange = true;
            appStateService.hasAuthenticateMessage = false;
            appStateService.hasRestrictedMessage = false;
            appStateService.hasMaxTurnoverMessage = false;
            appStateService.hasCountryMessage = false;
            appStateService.hasTnCMessage = false;
            appStateService.hasTaxInfoMessage = false;
            appStateService.hasFinancialAssessmentMessage = false;
            appStateService.hasAgeVerificationMessage = false;
            appStateService.hasCurrencyMessage = false;
            appStateService.checkedAccountStatus = false;
            notificationService.emptyNotices();
            appStateService.checkingUpgradeDone = false;
        };

        $scope.$on("authorize", (e, authorize) => {
            if (authorize && appStateService.newAccountAdded) {
                let account = _.find(authorize.account_list, acc => acc.loginid === authorize.loginid);
                account = _.assign(authorize, account);
                accountService.add(account);
                appStateService.newAccountAdded = false;
                accountService.setDefault(authorize.token);
                vm.updateAccount(authorize.token);
                vm.accounts = accountService.getAll();
                vm.selectedAccount = authorize.token;
                appStateService.virtuality = authorize.is_virtual;
                accountService.addedAccount = "";
                const selectedCurrency = appStateService.selectedCurrency || '';
                validationService.reset();

                if (!authorize.currency && !selectedCurrency) {
                    $state.go("set-currency")
                } else if (!authorize.currency && selectedCurrency) {
                    websocketService.sendRequestFor.setAccountCurrency(selectedCurrency);
                } else {
                    $state.go("trade");
                }
            } else if (authorize && updatingAccount) {
                validationService.reset();
            }
        });

        $scope.$on('set_account_currency:success', (e, currency) => {
            const accounts = accountService.getAll();
            for (let i = 0; i < accounts.length; i++) {
                if (accounts[i].is_default === true){
                    accounts[i].currency = currency;
                    break;
                }
            }
            localStorage.accounts = JSON.stringify(accounts);
            localStorage.setItem("accounts", JSON.stringify(accounts));
            appStateService.accountCurrencyChanged = true;
            $rootScope.$broadcast("currency:changed", currency);
            validationService.reset();
            $state.go("trade");
        });
    }
})();
