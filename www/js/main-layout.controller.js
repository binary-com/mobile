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
        vm.hasNotSelectedCountry = false;
        let currentAccount = {};
        vm.serverUrl = websocketService.getServerURL;
        vm.defaultServerUrl = config.serverUrl;

        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        const getAccountInfo = () => {
            vm.upgrade = {};
            vm.accounts = accountService.getAll();
            currentAccount = accountService.getDefault();
            if (!_.isEmpty(currentAccount)) {
                const landingCompany = currentAccount.landing_company_name;
                vm.showNetworkStatus = isLandingCompanyOf('iom', landingCompany) ||
                    isLandingCompanyOf('malta', landingCompany) ||
                    isLandingCompanyOf('maltainvest', landingCompany);
                if (currentAccount.country) {
                    const country = currentAccount.country;
                    $scope.$applyAsync(() => {
                        vm.hasNotSelectedCountry = false;
                    });
                    if (country !== 'jp') {
                        const reqId = 1;
                        websocketService.sendRequestFor.landingCompanySend(country, reqId);
                    }
                } else {
                    $scope.$applyAsync(() => {
                        vm.hasNotSelectedCountry = true;
                    });
                }
            } else {
                $timeout(getAccountInfo, 1000);
            }
        };

        getAccountInfo();

        const hasShortCode = (data, code) => ((data || {}).shortcode === code);

        const hasMTfinancialCompany = data => (hasShortCode(data.financial_company, 'vanuatu'));

        const getExistingCurrencies = accounts => clientService.getExistingCurrencies(accounts);

        const getDividedCurrencies = currencies => clientService.dividedCurrencies(currencies);

        const getUpgradeInfo = landingCompanyObj => {
            const upgradeableLandingCompanies = appStateService.upgradeableLandingCompanies;
            const currentLandingCompany = currentAccount.landing_company_name;
            let canUpgrade = !!(upgradeableLandingCompanies && upgradeableLandingCompanies.length);
            let canUpgradeMultiAccount = false;
            let multi = false;
            let typeOfNextAccount;
            let upgradeLink;
            let currencyOptions;
            let allowedMarkets;
            if (canUpgrade) {
                canUpgradeMultiAccount =
                !!_.find(upgradeableLandingCompanies, landingCompany => landingCompany === currentLandingCompany);
            }

            const canUpgradeToLandingCompany = arr_landing_company => !!_.find(arr_landing_company, landingCompany =>
                landingCompany !== currentLandingCompany && upgradeableLandingCompanies.indexOf(landingCompany) > -1);

            if (canUpgradeToLandingCompany(['costarica', 'svg', 'malta', 'iom']) && !canUpgradeMultiAccount) {
                typeOfNextAccount = 'real';
                upgradeLink = 'real-account-opening';
                currencyOptions = landingCompanyObj.gaming_company ?
                    landingCompanyObj.gaming_company.legal_allowed_currencies :
                    landingCompanyObj.financial_company.legal_allowed_currencies;
                allowedMarkets = landingCompanyObj.gaming_company ?
                    landingCompanyObj.gaming_company.legal_allowed_markets :
                    landingCompanyObj.financial_company.legal_allowed_markets;
            } else if (canUpgradeToLandingCompany(['maltainvest'])) {
                typeOfNextAccount = 'financial';
                upgradeLink = 'maltainvest-account-opening';
                currencyOptions = landingCompanyObj.financial_company.legal_allowed_currencies;
                allowedMarkets = landingCompanyObj.financial_company.legal_allowed_markets;
            } else if (canUpgradeMultiAccount) {
                typeOfNextAccount = 'real';
                upgradeLink = '';
                allowedMarkets = landingCompanyObj.financial_company.legal_allowed_markets;
                const legalAllowedCurrencies = landingCompanyObj.financial_company.legal_allowed_currencies;
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
            // check for upgrade info after changing account or user selects country in profile page and updates settings
            if (currentAccount &&
              (currentAccount.id !== authorize.loginid || currentAccount.country !== authorize.country)) {
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
                vm.upgrade = getUpgradeInfo(landingCompany);
                if (vm.upgrade.canUpgrade) {
                    appStateService.upgrade = vm.upgrade;
                } else {
                    appStateService.upgrade = {};
                }
                appStateService.checkingUpgradeDone = true;
            }
        });

        vm.goToRegulatory = function() {
            const linkToRegulatory = `https://www.binary.com/${localStorage.getItem("language") || "en"}/regulation.html`;
            window.open(linkToRegulatory, "_blank");
        };

        vm.goToNetworkStatus = () => {
            window.open("https://binarycom.statuspage.io/", "_blank");
        };

        vm.goToResponsbileTrading = () => {
            const linkToResponsibleTrading = `https://www.binary.com/${localStorage.getItem("language") || "en"}/responsible-trading.html`;
            window.open(linkToResponsibleTrading, "_blank");
        };

    });
