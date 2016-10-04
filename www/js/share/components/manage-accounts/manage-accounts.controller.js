/**
 * @name manage-accounts controller
 * @author
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.manage-accounts.controllers')
        .controller('ManageAccountsController', ManageAccounts);

    ManageAccounts.$inject = ['$scope', '$state', '$ionicLoading', 'languageService', 'accountService', 'websocketService', 'appStateService', 'alertService', 'cleanupService', 'proposalService', 'marketService'];

    function ManageAccounts($scope, $state, $ionicLoading, languageService, accountService, websocketService, appStateService, alertService, cleanupService, proposalService, marketService) {
        var vm = this;

        var requestId = null;
        vm.accounts = accountService.getAll();

        $scope.$on('authorize', (e, response, reqId) => {
            $ionicLoading.hide();
            if (response) {
                if (reqId === requestId) {
                    if (accountService.isUnique(response.loginid)) {
                        $scope.$applyAsync(() => {
                            accountService.add(response);
                            accountService.setDefault(response.token);
                            vm.accounts = accountService.getAll();
                        });
                    } else {
                        if (vm.settingDefault) {
                            vm.settingDefault = false;
                        } else {
                            alertService.accountError.tokenNotUnique();
                        }
                    }

                }
            } else {
                alertService.accountError.tokenNotAuthenticated(reqId);
            }

        });

        $scope.$on('token:remove', (e, response) => {
            $scope.$applyAsync(() => {
                accountService.remove(response);
                vm.accounts = accountService.getAll();
            });
        });

        var cleanLocalData = function() {
            marketService.removeActiveSymbols();
            marketService.removeAssetIndex();
            appStateService.isLoggedin = false;
        };

        vm.addAccount = function(_token) {
            $ionicLoading.show();
            requestId = new Date().getTime();
            vm.showSpinner = false;
            // Validate the token
            if (_token && _token.length === 15) {

                cleanLocalData();

                accountService.validate(_token, {
                    req_id: requestId
                });
                appStateService.isChangedAccount = true;
                sessionStorage.removeItem('start');
                sessionStorage.removeItem('_interval');
                appStateService.isCheckedAccountType = false;
                appStateService.isCheckedAccountType = false;
                appStateService.isNewAccountReal = false;
                appStateService.isNewAccountMaltainvest = false;
                appStateService.hasMLT = false;
                sessionStorage.removeItem('countryParams');
                appStateService.isPopupOpen = false;
                appStateService.profitTableRefresh = true;
                appStateService.statementRefresh = true;
            } else {
                $ionicLoading.hide();
                alertService.accountError.tokenNotValid();
            }
        };

        vm.removeAccount = function(_token) {
            alertService.confirmAccountRemoval(_token);
        };

        vm.setAccountAsDefault = function(_token) {
            requestId = new Date().getTime();
            vm.settingDefault = true;

            cleanLocalData();

            accountService.setDefault(_token);
            $ionicLoading.show();
            accountService.validate(null, {
                req_id: requestId
            });
            vm.accounts = accountService.getAll();
            sessionStorage.clear('_interval');
            appStateService.isChangedAccount = true;
            appStateService.isCheckedAccountType = false;
            sessionStorage.removeItem('start');
            sessionStorage.removeItem('_interval');
            appStateService.profitTableRefresh = true;
            appStateService.statementRefresh = true;
            appStateService.isNewAccountReal = false;
            appStateService.isNewAccountMaltainvest = false;
            appStateService.hasMLT = false;
            sessionStorage.removeItem('countryParams');
            appStateService.isPopupOpen = false;
        };

    }
})();
