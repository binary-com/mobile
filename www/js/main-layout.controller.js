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
            vm.multiAccountopening = {};
            vm.accounts = accountService.getAll();
            this.currentAccount = accountService.getDefault();
            const country = this.currentAccount.country;
            websocketService.sendRequestFor.landingCompanySend(country);
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
            }
            return {
                typeOfNextAccount,
                upgradeLink,
                canUpgrade,
                currencyOptions,
                allowedMarkets
            }
        };

        const getMultiAccountInfo = (landingCompany, id) => {
            let canUpgrade = false;
            let currencyOptions = {};
            let allowedMarkets = {};
            const typeOfNextAccount = 'real';
            const upgradeLink = 'real-account-opening';
            if (!isAccountOfType('virtual', id)) {
                allowedMarkets = getLegalAllowedMarkets(id, landingCompany);
                if (canUpgradeMultiAccount(landingCompany)) {
                    const legalAllowedCurrencies = getLegalAllowedCurrencies(id, landingCompany);
                    const existingCurrencies = getExistingCurrencies(vm.accounts);
                    if (existingCurrencies.length) {
                        const dividedExistingCurrencies = getDividedCurrencies(existingCurrencies);
                        if (dividedExistingCurrencies.fiatCurrencies.length) {
                            const legalAllowedCryptoCurrencies = getDividedCurrencies(legalAllowedCurrencies).cryptoCurrencies;
                            const existingCryptoCurrencies = dividedExistingCurrencies.cryptoCurrencies;
                            currencyOptions = _.difference(legalAllowedCryptoCurrencies, existingCryptoCurrencies);
                            if (currencyOptions.length) {
                                canUpgrade = true;
                            }
                        } else {
                            canUpgrade = true;
                            currencyOptions = _.difference(legalAllowedCurrencies, existingCurrencies);
                        }
                    } else {
                        canUpgrade = true;
                        currencyOptions = legalAllowedCurrencies;
                    }
                }
            };
            return {
                canUpgrade,
                upgradeLink,
                currencyOptions,
                allowedMarkets,
                typeOfNextAccount
            }
        }

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
            vm.multiAccountopening = getMultiAccountInfo(landingCompany, this.currentAccount.id);
            if (vm.upgrade.canUpgrade) {
                appStateService.upgrade = vm.upgrade;
            } else if (vm.multiAccountopening.canUpgrade) {
                appStateService.upgrade = vm.multiAccountopening;
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
