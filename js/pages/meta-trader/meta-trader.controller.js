/**
 * @name MetaTrader Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 04/15/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.meta-trader.controllers").controller("MetaTraderController", MetaTrader);

    MetaTrader.$inject = ["$scope", "$translate", "$state", "accountService", "websocketService", "clientService", "appStateService"];

    function MetaTrader($scope, $translate, $state, accountService, websocketService, clientService, appStateService) {
        const vm = this;
        vm.isLoaded = false;
        vm.hasAccount = false;
        vm.accountsList = {};
        vm.hasMTAccess = false;
        vm.canUpgrade = false;
        vm.showUpgradeToRealButton = false;
        const accounts = {};
        const accountsInfo = {};
        const mtCompany = {};
        const landingCompanyObject = JSON.parse(localStorage.getItem('landingCompanyObject'));

        const mtCompanies = {
            financial: {
                standard: { mt5_account_type: 'standard',      max_leverage: 1000, title: $translate.instant('mt.standard') },
                advanced: { mt5_account_type: 'advanced',      max_leverage: 300,  title: $translate.instant('mt.advanced') },
                mamm    : { mt5_account_type: 'mamm_advanced', max_leverage: 300,  title: $translate.instant('mt.mam_advanced'), is_real_only: 1 },
            },
            gaming: {
                volatility: { mt5_account_type: '',     max_leverage: 500, title: $translate.instant('mt.volatility_indices') },
                mamm      : { mt5_account_type: 'mamm', max_leverage: 500, title: $translate.instant('mt.mam_volatility_indices'), is_real_only: 1 },
            },
        };

        const addAccount = company => {
            _.forEach(['demo', 'real'], type => {
                _.forEach(_.keys(mtCompanies[company]), accType => {
                    const companyInfo = mtCompanies[company][accType];
                    const mt5AccountType = companyInfo.mt5_account_type;
                    // add translate to this later
                    const title = companyInfo.title;
                    const isDemo = type === 'demo';

                    if (!(isDemo && companyInfo.is_real_only)) {
                        accountsInfo[`${type}_${mtCompany[company]}${mt5AccountType ? `_${mt5AccountType}` : ''}`] = {
                            title,
                            isDemo,
                            mt5AccountType,
                            accountType: isDemo ? 'demo' : company,
                            maxLeverage: companyInfo.max_leverage,
                            shortTitle : companyInfo.title,
                        };
                    }
                });
            });
        };

        const getMT5AccountType = group => (group ? group.replace('\\', '_').replace(/_(\d+|master)/, '') : ''); // remove manager id or master distinction from group

        const getMT5LoginList = () => websocketService.sendRequestFor.mt5LoginList();

        const getAllAccountsInfo = list => {
            // Ignore old accounts which are not linked to any group or has deprecated group
            const mt5LoginList = _.filter(list, obj => obj.group && getMT5AccountType(obj.group) in accountsInfo);

            _.forEach(mt5LoginList, obj => {
                if (obj) {
                    const accountType = getMT5AccountType(obj.group);
                    accountsInfo[accountType].info = obj;
                    const account = obj;
                    account.isDemo = accountsInfo[accountType].isDemo;
                    account.shortTitle = accountsInfo[accountType].shortTitle;
                    accounts[account.login] = account;
                }
            });

            $scope.$applyAsync(() => {
                vm.canUpgrade = !!_.find(accountsInfo, acc => !acc.hasOwnProperty('info'));
                vm.accountsList = clientService.groupMT5Accounts(accounts);
                vm.isLoaded = true;
                vm.hasAccount = !_.isEmpty(vm.accountsList);
            });
        };

        const isEligible = () => {
            let hasMTCompany = false;
            _.forEach(_.keys(mtCompanies), company => {
                const landingCompany = `mt_${company}_company`;
                if (landingCompanyObject.hasOwnProperty(landingCompany)) {
                    mtCompany[company] = landingCompanyObject[landingCompany].shortcode;
                    if (mtCompany[company]) {
                        hasMTCompany = true;
                        addAccount(company);
                    }
                }
            });
            return hasMTCompany;
        };

        $scope.$on('mt5_login_list:success', (e, list) => {
            getAllAccountsInfo(list);
        });

        vm.createMTAccount = () => {
            window.open(`https://www.binary.com/en/user/metatrader.html`, "_system");
        };

        vm.openMT5 = type => {
            type = type || "_blank";
            if (["android", "ios"].indexOf(ionic.Platform.platform()) > -1) {
                $state.go("mt5-web");
                return;
            }

            const url = "https://trade.mql5.com/trade?servers=Binary.com-Server&trade_server=Binary.com-Server";
            window.open(url, type);
        };

        vm.redirectToUpgrade = () => {
            const linkToUpgrade = appStateService.upgrade.upgradeLink;
            $state.go(linkToUpgrade);
        };

        const init = () => {
            if (isEligible()) {
                const accounts = accountService.getAll();
                vm.hasRealAccount = !!_.find(accounts, obj =>
                    _.indexOf(['malta', 'costarica', 'svg', 'iom', 'maltainvest'], obj.landing_company_name) > -1);
                if (!vm.hasRealAccount && appStateService.upgrade && appStateService.upgrade.upgradeLink) {
                    vm.showUpgradeToRealButton = true;
                }
                $scope.$applyAsync(() => {
                    vm.hasMTAccess = true;
                });
                getMT5LoginList();
            } else {
                $scope.$applyAsync(() => {
                    vm.hasMTAccess = false;
                    vm.isLoaded = true;
                });
                //  show feature not available error
            }
        };

        init();

    }
})();
