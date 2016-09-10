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

    ManageAccounts.$inject = ['$scope', '$state', 'languageService', 'accountService', 'websocketService', 'appStateService', 'alertService', 'cleanupService', 'proposalService', '$ionicLoading', 'marketService'];

    function ManageAccounts($scope, $state, languageService, accountService, websocketService, appStateService, alertService, cleanupService, proposalService, $ionicLoading, marketService) {
        var vm = this;

        var requestId = null;
        vm.accounts = accountService.getAll();

        $scope.$on('authorize', function(e, response, reqId) {
            $ionicLoading.hide();
            if (response) {
                if (reqId === requestId) {
                    if (accountService.isUnique(response.loginid)) {
                        $scope.$applyAsync(function() {
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

                    // reloading language setting
                    //languageService.set();
                }
            } else {
                alertService.accountError.tokenNotAuthenticated(reqId);
            }

        });

        $scope.$on('token:remove', function(e, response) {
            $scope.$applyAsync(function() {
                accountService.remove(response);
                vm.accounts = accountService.getAll();
            });
        });

        var cleanLocalData = function() {
            // Clearing local data
            proposalService.remove();
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
                localStorage.removeItem('profitTable');
                $rootScope.$broadcast('changedAccount');
                appStateService.isPopupOpen = false;
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
            sessionStorage.removeItem('start');
            sessionStorage.removeItem('_interval');
        };

    }
})();
