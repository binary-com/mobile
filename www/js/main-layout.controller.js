angular
    .module("binary")
    .controller("MainLayoutController", function($scope,
        $state,
        config,
        websocketService,
        appStateService,
        accountService,
        currencyService) {
        const vm = this;
        vm.hasMTAccess = false;

        const getAccountInfo = () => {
            vm.upgrade = {};
            vm.accounts = accountService.getAll();
            this.currentAccount = accountService.getDefault();
            const country = this.currentAccount.country;
            if (country !== 'jp') {
                websocketService.sendRequestFor.landingCompanySend(country);
            }
        };

        const getAllLoginids = _accounts => accountService.getAllloginids(_accounts);

        const isAccountOfType = (type, loginid) => currencyService.isAccountOfType(type, loginid);

        const getAccountOfType = type => {
            const id = getAllLoginids(vm.accounts).find(loginid => isAccountOfType(type, loginid));
            return id;
        };

        const hasAccountOfType = type => !!getAccountOfType(type);

        const hasShortCode = (data, code) => ((data || {}).shortcode === code);

        const hasMTfinancialCompany = data => (hasShortCode(data.financial_company, 'vanuatu'));

        const canUpgradeGamingToFinancial = data => (hasShortCode(data.financial_company, 'maltainvest'));
        const canUpgradeVirtualToFinancial = data => (!data.gaming_company && hasShortCode(data.financial_company, 'maltainvest'));
        const canUpgradeMultiAccount = data =>  (hasShortCode(data.financial_company, 'costarica'));

        const getLegalAllowedCurrencies = (loginid, landingCompany) =>
            currencyService.landingCompanyValue(loginid, 'legal_allowed_currencies', landingCompany);
        const getLegalAllowedMarkets = (loginid, landingCompany) =>
            currencyService.landingCompanyValue(loginid, 'legal_allowed_markets', landingCompany);

        const getExistingCurrencies = accounts => currencyService.getExistingCurrencies(accounts);

        const getDividedCurrencies = currencies => currencyService.dividedCurrencies(currencies);

        const getUpgradeInfo = (landingCompany, id) => {
            let typeOfNextAccount = 'real';
            let upgradeLink = 'real-account-opening'
            let canUpgrade = false;
            let currencyOptions = landingCompany.gaming_company.legal_allowed_currencies;
            let allowedMarkets = {};
            let multi = false;
            if (isAccountOfType('virtual', id)) {
                if (canUpgradeVirtualToFinancial(landingCompany)) {
                    typeOfNextAccount = 'financial';
                    upgradeLink = 'maltainvest-account-opening';
                    currencyOptions = landingCompany.financial_company.legal_allowed_currencies;
                }
                canUpgrade = !hasAccountOfType('real');
                allowedMarkets = getLegalAllowedMarkets(id, landingCompany);
            } else if (canUpgradeGamingToFinancial(landingCompany)) {
                typeOfNextAccount = 'financial';
                upgradeLink = 'maltainvest-account-opening';
                canUpgrade = !hasAccountOfType('financial');
                currencyOptions = landingCompany.financial_company.legal_allowed_currencies;
                allowedMarkets = getLegalAllowedMarkets(id, landingCompany);
            } else if (canUpgradeMultiAccount(landingCompany)) {
                allowedMarkets = getLegalAllowedMarkets(id, landingCompany);
                const legalAllowedCurrencies = getLegalAllowedCurrencies(id, landingCompany);
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
            };
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
            if (this.currentAccount.id !== authorize.loginid) {
                getAccountInfo();
            }
        });

        $scope.$on('currency:changed', (currency) => {
            getAccountInfo();
        });

        $scope.$on('landing_company', (e, landing_company) => {
            const landingCompany = landing_company;
            vm.hasMTAccess = hasMTfinancialCompany(landingCompany);
            vm.upgrade = getUpgradeInfo(landingCompany, this.currentAccount.id);
            if (vm.upgrade.canUpgrade) {
                appStateService.upgrade = vm.upgrade;
            } else {
                appStateService.upgrade = {};
            }
        });

        getAccountInfo();

        vm.linkToRegulatory = `https://www.binary.com/${localStorage.getItem("language") || "en"}/regulation.html`;
        vm.goToRegulatory = function() {
            window.open(vm.linkToRegulatory, "_blank");
        };



    });
