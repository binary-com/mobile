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

        const getUpgradeInfo = landingCompany => {
            let typeOfNextAccount = 'real';
            let upgradeLink = 'real-account-opening'
            let canUpgrade = false;
            if (isAccountOfType('virtual', this.currentAccount.id)) {
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

        $scope.$on('authorize', (e, authorize) => {
            if (this.currentAccount.id !== authorize.loginid) {
                getAccountInfo();
            }
        });

        $scope.$on('landing_company', (e, landing_company) => {
            const landingCompany = landing_company;
            vm.upgrade = getUpgradeInfo(landingCompany);
        });

        getAccountInfo();

    }
})();
