/**
 * @name account-upgrade controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.account-upgrade.controllers")
        .controller("AccountUpgradeController", AccountUpgrade);

    AccountUpgrade.$inject = ["$scope",
        "$state",
        "config",
        "websocketService",
        "appStateService",
        "accountService",
        "currencyService"];

    function AccountUpgrade($scope,
        $state,
        config,
        websocketService,
        appStateService,
        accountService,
        currencyService) {
        const vm = this;
        vm.reset = function() {
            vm.data = {};
            vm.countryParams = {};
            vm.showUpgradeLink = false;
            vm.showUpgradeLinkMaltainvest = false;
            vm.isCheckedCompany = false;
            appStateService.hasMLT = false;
            vm.toReal = false;
            vm.toMaltainvest = false;
            vm.idsFound = [];
            appStateService.isNewAccountReal = false;
            appStateService.isNewAccountMaltainvest = false;
            appStateService.isCheckedAccountType = false;
        };

        vm.reset();

        vm.init = function() {
            // in case the authorize response is passed before the execution of this controller
            // get the virtuality of account by appStateService.virtuality which is saved in authorize
            if (appStateService.isLoggedin && !appStateService.isCheckedAccountType) {
                vm.reset();
                vm.isVirtual = appStateService.virtuality === 1;
                vm.getCompany();
            }
        };

        // get account-setting and landing-company
        vm.getCompany = function() {
            appStateService.isCheckedAccountType = true;
            websocketService.sendRequestFor.accountSetting();
        };

        // in case still not authorized when this controller is executed listen for the response of authorize
        $scope.$on("authorize", (e, response) => {
            if (!appStateService.isCheckedAccountType) {
                vm.reset();
                appStateService.isCheckedAccountType = true;
                vm.isVirtual = response.is_virtual === 1;
                vm.getCompany();
            }
        });

        $scope.$on("set-settings", (e, set_settings) => {
            if (set_settings === 1) {
                vm.reset();
                vm.getCompany();
            }
        });

        $scope.$on("get_settings", (e, get_settings) => {
            vm.data.setting = get_settings;
            vm.data.countryCode = vm.data.setting.country_code;
            vm.data.countryOfAccount = vm.data.setting.country;
            vm.countryParams.countryCode = vm.data.countryCode;
            vm.countryParams.countryOfAccount = vm.data.countryOfAccount;
            sessionStorage.countryParams = JSON.stringify(vm.countryParams);
            if (vm.data.countryCode && vm.data.countryCode !== "jp") {
                websocketService.sendRequestFor.landingCompanySend(vm.data.countryCode);
            }
        });

        $scope.$on("landing_company", (e, landing_company) => {
            if (!vm.isCheckedCompany && vm.data.countryCode !== "jp") {
                vm.isCheckedCompany = true;
                vm.accountStates(landing_company);
            }
        });

        // check 3 states combining of Maltainvest shortcode, gaming company and financial company
        vm.accountStates = function(landing_company) {
            vm.data.landingCompany = landing_company;
            if ((vm.data.landingCompany.hasOwnProperty('financial_company') &&
	            vm.data.landingCompany.financial_company.shortcode !== "maltainvest") ||
	            !vm.data.landingCompany.hasOwnProperty('financial_company')
            ) {
                if (vm.isVirtual) {
                    vm.toReal = true;
                    vm.getToken();
                } else if (!vm.isVirtual &&
                    vm.data.landingCompany.hasOwnProperty('financial_company')
                    && vm.data.landingCompany.financial_company.shortcode === 'costarica') {
                    vm.checkMultiAccountOpening();
                }
            } else if (vm.data.landingCompany.hasOwnProperty('financial_company') &&
              vm.data.landingCompany.financial_company.shortcode === "maltainvest" &&
              vm.data.landingCompany.hasOwnProperty('gaming_company') &&
              vm.data.landingCompany.gaming_company.shortcode === "malta"
            ) {
	             // check if has MLT then to MF, if not to MLT
                if ( vm.isVirtual ) {
                    vm.toReal = true;
                } else {
                    vm.toMaltainvest = true;
                }
                appStateService.hasMLT = !!vm.toMaltainvest;
                vm.getToken();
            } else if (vm.data.landingCompany.hasOwnProperty('financial_company') &&
	            vm.data.landingCompany.financial_company.shortcode === "maltainvest" &&
	            !vm.data.landingCompany.hasOwnProperty('gaming_company')
            ) {
	            //  to MF
	            vm.toMaltainvest = true;
	            vm.getToken();
            }
        };

        vm.checkMultiAccountOpening = () => {
            let getCurrencyOptions = {};
            const accounts = accountService.getAll();
            const currencyConfig = config.currencyConfig;
            const currentAccount = accountService.getDefault();
            const legalAllowedCurrencies = vm.data.landingCompany.financial_company.legal_allowed_currencies
            const existingCurrencies = currencyService.getExistingCurrencies(accounts);
            if (existingCurrencies.length) {
                const dividedExistingCurrencies = currencyService.dividedCurrencies(existingCurrencies);
                const hasFiat = dividedExistingCurrencies.fiatCurrencies.length > 0;
                if (hasFiat) {
                    const legalAllowedCryptoCurrencies =
                        currencyService.dividedCurrencies(legalAllowedCurrencies).cryptoCurrencies;
                    const existingCryptoCurrencies = dividedExistingCurrencies.cryptoCurrencies;
                    getCurrencyOptions = _.difference(legalAllowedCryptoCurrencies, existingCryptoCurrencies);
                    if (_.keys(getCurrencyOptions).length > 0) {
                        vm.toMultiAccount = true;
                        appStateService.isMultiAccountOpening = true;
                        appStateService.currencyOptions = getCurrencyOptions;
                        appStateService.legalAllowedMarkets =
                            vm.data.landingCompany.financial_company.legal_allowed_markets;
                    }
                } else {
                    vm.toMultiAccount = true;
                    appStateService.isMultiAccountOpening = true;
                    getCurrencyOptions = _.difference(legalAllowedCurrencies, existingCurrencies);
                    appStateService.currencyOptions = getCurrencyOptions;
                    appStateService.legalAllowedMarkets =
                        vm.data.landingCompany.financial_company.legal_allowed_markets;
                }
            } else {
                vm.toMultiAccount = true;
                appStateService.isMultiAccountOpening = true;
                getCurrencyOptions = legalAllowedCurrencies;
                appStateService.currencyOptions = getCurrencyOptions;
                appStateService.legalAllowedMarkets = vm.data.landingCompany.financial_company.legal_allowed_markets;
            }
        };

        // get tokens from localStorage
        vm.getToken = function() {
            if (localStorage.hasOwnProperty("accounts")) {
                vm.accounts = accountService.getAll();
                vm.findTokens();
            }
        };

        vm.findTokens = function() {
            if (vm.toReal) {
                vm.idsFound = [];
                vm.count = vm.accounts.length;
                vm.accounts.forEach((el, i) => {
                    vm.val = vm.accounts[i].id;
                    if (_.startsWith(vm.val, "VRTC")) {
                        vm.idsFound.push("VRTC");
                    } else if (_.startsWith(vm.val, "MX")) {
                        vm.idsFound.push("MXorCRorMLT");
                    } else if (_.startsWith(vm.val, "CR")) {
                        vm.idsFound.push("MXorCRorMLT");
                    } else if (_.startsWith(vm.val, "MLT")) {
                        vm.idsFound.push("MXorCRorMLT");
                    }

                    if (!--vm.count) {
                        vm.toRealStages();
                    }
                });
            } else if (vm.toMaltainvest) {
                vm.idsFound = [];
                vm.count = vm.accounts.length;
                vm.accounts.forEach((el, i) => {
                    vm.val = vm.accounts[i].id;
                    if (_.startsWith(vm.val, "MF")) {
                        vm.idsFound.push("MF");
                    }

                    if (!--vm.count) {
                        vm.toMaltainvestStages();
                    }
                });
            }
        };

        vm.toRealStages = function() {
            if (vm.idsFound.indexOf("VRTC") > -1 && vm.idsFound.indexOf("MXorCRorMLT") < 0) {
                // can upgrade to MX or CR
                // use https://developers.binary.com/api/#new_account_real
                appStateService.currencyOptions = vm.data.landingCompany.gaming_company.legal_allowed_currencies;
                appStateService.legalAllowedMarkets = vm.data.landingCompany.gaming_company.legal_allowed_markets;
                vm.newAccountReal();
            }
        };

        vm.toMaltainvestStages = function() {
            if (vm.idsFound.indexOf("MF") < 0) {
                appStateService.currencyOptions = vm.data.landingCompany.financial_company.legal_allowed_currencies;
                appStateService.legalAllowedMarkets = vm.data.landingCompany.financial_company.legal_allowed_markets;
                vm.newAccountMaltainvest();
            }
        };

        // functions for showing the upgrade link and show the related forms to the condition
        vm.newAccountReal = function() {
            $scope.$applyAsync(() => {
                if (appStateService.isCheckedAccountType) {
                    vm.showUpgradeLink = true;
                    appStateService.isNewAccountReal = true;
                }
            });
        };

        vm.newAccountMaltainvest = function() {
            $scope.$applyAsync(() => {
                if (appStateService.isCheckedAccountType) {
                    vm.showUpgradeLinkMaltainvest = true;
                    appStateService.isNewAccountMaltainvest = true;
                }
            });
        };

        $scope.$on("logout", e => {
            $scope.$applyAsync(() => {
                vm.reset();
            });
        });

        // link to forms page
        vm.navigateToUpgrade = function() {
            if (appStateService.isNewAccountReal) $state.go("real-account-opening");
            else if (appStateService.isNewAccountMaltainvest) {
                $state.go("maltainvest-account-opening");
            }
        };

        vm.navigateToCreateNewAccount = () => {
            $state.go("accounts-management");
        }

        vm.init();
    }
})();
