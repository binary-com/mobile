/**
 * @name accounts controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.accounts.controllers')
        .controller('AccountsController', Accounts);

    Accounts.$inject = [
        '$scope', '$state', '$ionicSideMenuDelegate', 'accountService', 'appStateService',
        'utilsService', 'websocketService'
    ];

    function Accounts(
        $scope,
        $state,
        $ionicSideMenuDelegate,
        accountService,
        appStateService,
        utilsService,
        websocketService
    ) {
        var vm = this;

        var init = function() {
            vm.accounts = accountService.getAll();
            vm.selectedAccount = accountService.getDefault().token;
        };

        var updateSymbols = function() {
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
            accountService.setDefault(_selectedAccount);
            accountService.validate();
            updateSymbols();
            appStateService.isChangedAccount = true;
            appStateService.isCheckedAccountType = false;
            sessionStorage.removeItem('start');
            sessionStorage.removeItem('_interval');
            appStateService.isProfitTableSet = false;
            appStateService.isStatementSet = false;
            appStateService.profitTableRefresh = true;
            appStateService.statementRefresh = true;
            appStateService.isNewAccountReal = false;
            appStateService.isNewAccountMaltainvest = false;
            appStateService.hasMLT = false;
            sessionStorage.removeItem('countryParams');
            appStateService.isPopupOpen = false;
            $ionicSideMenuDelegate.toggleLeft();
        };

        $scope.$on('authorize', (e, authorize) => {
            if (authorize && appStateService.newAccountAdded) {
                accountService.add(authorize);
                accountService.setDefault(accountService.addedAccount);
                appStateService.newAccountAdded = false;
                vm.accounts = accountService.getAll();
                vm.selectedAccount = accountService.getDefault().token;
                vm.updateAccount(vm.selectedAccount);
                $state.go('trade');
                accountService.addedAccount = '';
            }
        });


    }
})();
