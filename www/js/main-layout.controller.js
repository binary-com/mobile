angular
    .module("binary")
    .controller("MainLayoutController", function($scope,
        $state,
        $timeout,
        config,
        websocketService,
        appStateService,
        accountService,
        clientService) {
        const vm = this;
        vm.hasMTAccess = false;
        let currentAccount = {};
        vm.serverUrl = websocketService.getServerURL;
        vm.defaultServerUrl = config.serverUrl;

        const getAccountInfo = () => {
            vm.upgrade = {};
            vm.accounts = accountService.getAll();
            currentAccount = accountService.getDefault();
            if (currentAccount && _.keys(currentAccount).length) {
                if (currentAccount.country) {
                    const country = currentAccount.country;
                    if (country !== 'jp') {
                        const reqId = 1;
                        websocketService.sendRequestFor.landingCompanySend(country, reqId);
                    }
                }
            } else {
                $timeout(getAccountInfo, 1000);
            }
        };

        getAccountInfo();

        const hasShortCode = (data, code) => ((data || {}).shortcode === code);

        const hasMTfinancialCompany = data => (hasShortCode(data.financial_company, 'vanuatu'));

        const getLegalAllowedCurrencies = (loginid, landingCompany) =>
            clientService.landingCompanyValue(loginid, 'legal_allowed_currencies', landingCompany);
        const getLegalAllowedMarkets = (loginid, landingCompany) =>
            clientService.landingCompanyValue(loginid, 'legal_allowed_markets', landingCompany);

        const getExistingCurrencies = accounts => clientService.getExistingCurrencies(accounts);

        const getDividedCurrencies = currencies => clientService.dividedCurrencies(currencies);

        const getUpgradeInfo = (landingCompany, id) => {
            const upgradeableLandingCompanies = appStateService.upgradeableLandingCompanies;
            const currentLandingCompany = localStorage.getItem('landingCompany');
            let canUpgrade = !!(upgradeableLandingCompanies && upgradeableLandingCompanies.length);
            let canUpgradeMultiAccount = false;
            let multi = false;
            let typeOfNextAccount;
            let upgradeLink;
            let currencyOptions;
            let allowedMarkets;
            if (canUpgrade) {
                canUpgradeMultiAccount = 
                !!upgradeableLandingCompanies.find(landingCompany => landingCompany === currentLandingCompany);
            }

            const canUpgradeToLandingCompany = arr_landing_company => !!arr_landing_company.find(landingCompany => 
                landingCompany !== currentLandingCompany && upgradeableLandingCompanies.indexOf(landingCompany) > -1);

            if (canUpgradeToLandingCompany(['costarica', 'malta', 'iom'])) {
                typeOfNextAccount = 'real';
                upgradeLink = 'real-account-opening';

                if (canUpgradeMultiAccount) {
                    canUpgrade = false;
                    allowedMarkets = landingCompany.financial_company.legal_allowed_markets;
                    const legalAllowedCurrencies = landingCompany.financial_company.legal_allowed_currencies;
                    const existingCurrencies = getExistingCurrencies(vm.accounts);
                    if (existingCurrencies.length) {
                        const dividedExistingCurrencies = getDividedCurrencies(existingCurrencies);
                        if (dividedExistingCurrencies.fiatCurrencies.length) {
                            const legalAllowedCryptoCurrencies =
                            getDividedCurrencies(legalAllowedCurrencies).cryptoCurrencies;
                            const existingCryptoCurrencies = dividedExistingCurrencies.cryptoCurrencies;
                            currencyOptions = _.difference(legalAllowedCryptoCurrencies, existingCryptoCurrencies);
                            if (currencyOptions.length) {
                                canUpgrade = true;
                                multi = true;
                            }
                        } else {
                            canUpgrade = true;
                            multi = true;
                            currencyOptions = _.difference(legalAllowedCurrencies, existingCurrencies);
                        }
                    } else {
                        canUpgrade = true;
                        multi = true;
                        currencyOptions = legalAllowedCurrencies;
                    }
                } else {
                    currencyOptions = landingCompany.gaming_company.legal_allowed_currencies;
                    allowedMarkets = landingCompany.gaming_company.legal_allowed_markets;
                }
            } else if (canUpgradeToLandingCompany(['maltainvest'])) {
                typeOfNextAccount = 'financial';
                upgradeLink = 'maltainvest-account-opening';
                currencyOptions = landingCompany.financial_company.legal_allowed_currencies;
                allowedMarkets = landingCompany.financial_company.legal_allowed_markets;
            } else if (canUpgradeMultiAccount) {
                typeOfNextAccount = 'real';
                upgradeLink = '';
                allowedMarkets = landingCompany.financial_company.legal_allowed_markets;
                const legalAllowedCurrencies = landingCompany.financial_company.legal_allowed_currencies;
                const existingCurrencies = getExistingCurrencies(vm.accounts);
                if (existingCurrencies.length) {
                    const dividedExistingCurrencies = getDividedCurrencies(existingCurrencies);
                    const hasFiat = !!dividedExistingCurrencies.fiatCurrencies.length;
                    if (hasFiat) {
                        const legalAllowedCryptoCurrencies =
                        getDividedCurrencies(legalAllowedCurrencies).cryptoCurrencies;
                        const existingCryptoCurrencies = dividedExistingCurrencies.cryptoCurrencies;
                        currencyOptions = _.difference(legalAllowedCryptoCurrencies, existingCryptoCurrencies);
                        if (currencyOptions.length) {
                            canUpgrade = true;
                            multi = true;
                        }
                    } else {
                        canUpgrade = true;
                        multi = true;
                        currencyOptions = _.difference(legalAllowedCurrencies, existingCurrencies);
                    }
                } else {
                    canUpgrade = true;
                    multi = true;
                    currencyOptions = legalAllowedCurrencies;
                }
            } else {
                canUpgrade = false;
            }
            return {
                typeOfNextAccount,
                upgradeLink,
                canUpgrade,
                currencyOptions,
                allowedMarkets,
                multi
            }
        };

        $scope.$on('authorize', (e, authorize) => {
            if (currentAccount && currentAccount.id !== authorize.loginid) {
                getAccountInfo();
            }
        });

        $scope.$on('currency:changed', (currency) => {
            getAccountInfo();
        });

        $scope.$on('landing_company', (e, landing_company, req_id) => {
            const landingCompany = landing_company;
            vm.hasMTAccess = hasMTfinancialCompany(landingCompany);
            if (req_id === 1) {
                vm.upgrade = getUpgradeInfo(landingCompany, currentAccount.id);
                if (vm.upgrade.canUpgrade) {
                    appStateService.upgrade = vm.upgrade;
                } else {
                    appStateService.upgrade = {};
                }
                appStateService.checkingUpgradeDone = true;
            }
        });

        vm.linkToRegulatory = `https://www.binary.com/${localStorage.getItem("language") || "en"}/regulation.html`;
        vm.goToRegulatory = function() {
            window.open(vm.linkToRegulatory, "_blank");
        };



    });
