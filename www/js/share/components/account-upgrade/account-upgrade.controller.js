/**
 * @name account-upgrade controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.account-upgrade.controllers')
        .controller('AccountUpgradeController', AccountUpgrade);

    AccountUpgrade.$inject = ['$scope', '$state', 'websocketService', 'appStateService'];

    function AccountUpgrade($scope, $state, websocketService, appStateService) {
        var vm = this;
          vm.data = {};
          vm.countryParams = {};
          vm.showUpgradeLink = false;
          vm.showUpgradeLinkMaltainvest = false;
          vm.isCheckedCompany = false;
          appStateService.hasMLT = false;
          vm.isVirtual = false;
          vm.hasGamingAndVirtual = false;
          vm.hasGamingNotVirtual = false;
          vm.hasFinancialAndMaltainvest = false;
          vm.idsFound = [];

          vm.reset = function(){
            vm.data = {};
            vm.countryParams = {};
            vm.showUpgradeLink = false;
            vm.showUpgradeLinkMaltainvest = false;
            vm.isCheckedCompany = false;
            appStateService.hasMLT = false;
            vm.hasGamingAndVirtual = false;
            vm.hasGamingNotVirtual = false;
            vm.hasFinancialAndMaltainvest = false;
            vm.idsFound = [];
            appStateService.isNewAccountReal = false;
            appStateService.isNewAccountMaltainvest = false;
            appStateService.isCheckedAccountType = false;
            vm.hasGamingAndMaltainvest = false;
            vm.notMaltainvest = false;
            vm.hasGamingAndFinancialAndMaltainvest = false;
          }


        // get account-setting and landing-company
        vm.getCompany = function() {
            appStateService.isCheckedAccountType = true;
            websocketService.sendRequestFor.accountSetting();
        };

        // in case the authorize response is passed before the execution of this controller
        // get the virtuality of account by appStateService.virtuality which is saved in authorize
        if (appStateService.isLoggedin && !appStateService.isCheckedAccountType) {
          vm.reset();
            if (appStateService.virtuality === 1) {
                vm.isVirtual = true;
            } else {
                vm.isVirtual = false;
            }
            vm.getCompany();
        }

        // in case still not authorized when this controller is executed listen for the response of authorize
        $scope.$on('authorize', (e, response) => {
            if (!appStateService.isCheckedAccountType) {
                vm.reset();
                if (response.is_virtual === 1) {
                    vm.isVirtual = true;
                } else {
                    vm.isVirtual = false;
                }

                vm.getCompany();
            }
        });

        $scope.$on('set-settings', (e, set_settings) => {
          if(set_settings === 1) {
            vm.reset();
            vm.getCompany();
          }
        });


        $scope.$on('get_settings', (e, get_settings) => {
            vm.data.setting = get_settings;
            vm.data.countryCode = vm.data.setting.country_code;
            vm.data.countryOfAccount = vm.data.setting.country;
            vm.countryParams.countryCode = vm.data.countryCode;
            vm.countryParams.countryOfAccount = vm.data.countryOfAccount;
            sessionStorage.countryParams = JSON.stringify(vm.countryParams);
            if (vm.data.countryCode !== "jp") {
              websocketService.sendRequestFor.landingCompanySend(vm.data.countryCode);
            }
        });

        $scope.$on('landing_company', (e, landing_company) => {
            if (!vm.isCheckedCompany) {
                vm.isCheckedCompany = true;
                vm.accountStates(landing_company);
            }
        });

        // check 3 states combining of Maltainvest shortcode, gaming company and financial company
        vm.accountStates = function(landing_company) {
            vm.data.landingCompany = landing_company;
            if (vm.data.landingCompany.hasOwnProperty('gaming_company')) {
                if (vm.isVirtual) {
                    vm.hasGamingAndVirtual = true;
                    vm.getToken();
                } else {
                    if (vm.data.landingCompany.hasOwnProperty('financial_company') && (vm.data.landingCompany.financial_company.shortcode === "maltainvest")) {
                        vm.hasGamingNotVirtual = true;
                        vm.getToken();
                    }
                }
            } else if (!vm.data.landingCompany.hasOwnProperty('gaming_company')) {
                if (vm.isVirtual) {
                    if (vm.data.landingCompany.hasOwnProperty('financial_company') && (vm.data.landingCompany.financial_company.shortcode === "maltainvest")) {
                        vm.hasFinancialAndMaltainvest = true;
                        vm.getToken();
                    }
                }
            }
        }

        // get tokens from localStorage
        vm.getToken = function() {
            if (localStorage.hasOwnProperty('accounts')) {
                vm.accounts = JSON.parse(localStorage.accounts);
                vm.findTokens();

            }
        }

        vm.findTokens = function() {
            if (vm.hasGamingAndVirtual) {
                vm.idsFound = [];
                vm.count = vm.accounts.length;
                vm.accounts.forEach((el, i) => {
                        vm.val = vm.accounts[i]['id'];
                        if (_.startsWith(vm.val, 'VRTC')) {
                            vm.idsFound.push('VRTC');
                        } else if (_.startsWith(vm.val, 'MX')) {
                            vm.idsFound.push('MXorCRorMLT');
                        } else if (_.startsWith(vm.val, 'CR')) {
                            vm.idsFound.push('MXorCRorMLT');
                        } else if (_.startsWith(vm.val, 'MLT')) {
                            vm.idsFound.push('MXorCRorMLT');
                        }

                        if (!--vm.count) {
                            vm.gamingAndVirtualStages();
                        }
                    }

                );
            } else if (vm.hasGamingNotVirtual) {
                vm.idsFound = [];
                vm.count = vm.accounts.length;
                vm.accounts.forEach((el, i) => {
                    vm.val = vm.accounts[i]['id'];
                    if (_.startsWith(vm.val, 'MF')) {
                        vm.idsFound.push('MF');
                    }

                    if (!--vm.count) {
                        vm.gamingAndFinancialAndMaltainvestStages();
                    }
                });
            } else if (vm.hasFinancialAndMaltainvest) {
                vm.idsFound = [];
                vm.count = vm.accounts.length;
                vm.accounts.forEach((el, i) => {
                    vm.val = vm.accounts[i]['id'];
                    if (_.startsWith(vm.val, 'MF')) {
                        vm.idsFound.push('MF');
                    }

                    if (!--vm.count) {
                        vm.financialAndMaltainvestStages();
                    }
                });
            }
        }

        vm.gamingAndVirtualStages = function() {
            if (vm.idsFound.indexOf('VRTC') > -1 && vm.idsFound.indexOf('MXorCRorMLT') < 0) {
                // can upgrade to MX or CR
                // use https://developers.binary.com/api/#new_account_real
                vm.newAccountReal();
            }
        }

        vm.gamingAndFinancialAndMaltainvestStages = function() {
            if (vm.idsFound.indexOf('MF') < 0) {
                appStateService.hasMLT = true;
                vm.newAccountMaltainvest();
            }
        }
        vm.financialAndMaltainvestStages = function() {
                if (vm.idsFound.indexOf('MF') < 0) {
                    vm.newAccountMaltainvest();
                }
            }
            // functions for showing the upgrade link and show the related forms to the condition
        vm.newAccountReal = function() {
            $scope.$applyAsync(() => {
                if (appStateService.isCheckedAccountType) {
                    vm.showUpgradeLink = true;
                    appStateService.isNewAccountReal = true;
                }
            });
        }
        vm.newAccountMaltainvest = function() {
            $scope.$applyAsync(() => {
                if (appStateService.isCheckedAccountType) {
                    vm.showUpgradeLinkMaltainvest = true;
                    appStateService.isNewAccountMaltainvest = true;
                }
            });
        }
        $scope.$on('logout', (e) => {
            $scope.$applyAsync(() => {
              vm.reset();
            });
        });

    }
})();
