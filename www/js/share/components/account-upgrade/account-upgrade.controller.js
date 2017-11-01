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
        const currencyConfig = config.currencyConfig;

        const getAccountInfo = () => {
            vm.upgrade = {};
            this.currentAccount = accountService.getDefault();
            const country = this.currentAccount.country;
            websocketService.sendRequestFor.landingCompanySend(country);
        };

        const getAllLoginids = _accounts => accountService.getAllloginids(_accounts);

        const isAccountOfType = (type, loginid) => currencyService.isAccountOfType(type, loginid);

        const getAccountOfType = type => {
            const id = getAllLoginids().find(loginid => isAccountOfType(type, loginid));
            return id;
        };

        const hasAccountOfType = type => !!getAccountOfType(type);

        const hasShortCode = (data, code) => ((data || {}).shortcode === code);

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
            if (isAccountOfType('virtual', id)) {
                if (canUpgradeVirtualToFinancial(landingCompany)) {
                    typeOfNextAccount = 'financial';
                    upgradeLink = 'maltainvest-account-opening'
                }
                canUpgrade = !hasAccountOfType('real');
            } else if (canUpgradeGamingToFinancial(landingCompany)) {
                typeOfNextAccount = 'financial';
                upgradeLink = 'maltainvest-account-opening';
                canUpgrade = !hasAccountOfType('financial');
            }
            return {
                typeOfNextAccount,
                upgradeLink,
                canUpgrade
            }
        };

        const getMultiAccountInfo = (landingCompany, id) => {
            let canUpgrade = false;
            let currencyOptions = {};
            let allowedMarkets = {};
            if (!isAccountOfType('virtual', id)) {
                allowedMarkets = getLegalAllowedMarkets(id, landingCompany);
                if (canUpgradeMultiAccount(landingCompany)) {
                    const legalAllowedCurrencies = getLegalAllowedCurrencies(id, landingCompany);
                    const existingCurrencies = getExistingCurrencies(this.accounts);
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
                currencyOptions,
                allowedMarkets
            }
        }

        $scope.$on('authorize', (e, authorize) => {
            if (this.currentAccount.id !== authorize.loginid) {
                getAccountInfo();
            }
        });

        $scope.$on('landing_company', (e, landing_company) => {
            const landingCompany = landing_company;
            vm.upgrade = getUpgradeInfo(landingCompany, this.currentAccount.id);
            vm.multiAccountopening = getMultiAccountInfo(landingCompany, this.currentAccount.id);
        });

        getAccountInfo();

    }
})();
