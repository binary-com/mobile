/**
 * @name MetaTrader Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 04/15/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.meta-trader.controllers").controller("MetaTraderController", MetaTrader);

    MetaTrader.$inject = ["$scope", "$state", "accountService", "websocketService", "clientService"];

    function MetaTrader($scope, $state, accountService, websocketService, clientService) {
        const vm = this;
        vm.hasMTAccess = null;
        vm.canUpgrade = false;
        vm.accountsList = {};
        const accounts = {};
        const accountsInfo = {};
        const mtCompany = {};
        const landingCompanyObject = JSON.parse(localStorage.getItem('landingCompanyObject'));
        // vm.hasMTAccess = null;
        // vm.upgradeYourAccount = false;
        // vm.hasRealAccount = false;

        const mtCompanies = {
            financial: {
                standard: { mt5_account_type: 'standard',      max_leverage: 1000, title: 'Standard' },
                advanced: { mt5_account_type: 'advanced',      max_leverage: 300,  title: 'Advanced' },
                mamm    : { mt5_account_type: 'mamm_advanced', max_leverage: 300,  title: 'MAM Advanced', is_real_only: 1 },
            },
            gaming: {
                volatility: { mt5_account_type: '',     max_leverage: 500, title: 'Volatility Indices' },
                mamm      : { mt5_account_type: 'mamm', max_leverage: 500, title: 'MAM Volatility Indices', is_real_only: 1 },
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
                    accounts[account.login] = account;
                }
            });

            $scope.$applyAsync(() => {
                vm.canUpgrade = !!_.find(accountsInfo, (name, acc) => !acc.info);
                vm.accountsList = clientService.groupMT5Accounts(accounts);
            });
        };

        const isEligible = () => {
            let hasMTCompany = false;
            _.forEach(_.keys(mtCompanies), company => {
                const landingCompany = `mt_${company}_company`;
                mtCompany[company] = landingCompanyObject.hasOwnProperty(landingCompany) ?
                    landingCompanyObject[landingCompany].shortcode : false;
                if (mtCompany[company]) {
                    hasMTCompany = true;
                    addAccount(company);
                }
            });
            return hasMTCompany;
        };

        $scope.$on('mt5_login_list:success', (e, list) => {
            getAllAccountsInfo(list);

            // if (isVirtual) {
            //     getAllAccountsInfo(list);
            // } else {
            //     // get_limits.thengetAllAccountsInfo then exchange rates
            // }
        });

        const init = () => {
            if (isEligible()) {
                const accounts = accountService.getAll();
                vm.hasRealAccount = !!_.find(accounts, obj =>
                    _.indexOf(['malta', 'costarica', 'iom', 'maltainvest'], obj.landing_company_name) > -1);
                getMT5LoginList();
                $scope.$applyAsync(() => {
                    vm.hasMTAccess = true;
                });
            } else {
                $scope.$applyAsync(() => {
                    vm.hasMTAccess = false;
                });
                //  show feature not available error
            }
        };

        init();







        // vm.accountType = {
        //     demo      : "demo\\binary_virtual",
        //     volatility: "real\\costarica",
        //     financial : "real\\vanuatu_cent"
        // };
        //
        // $scope.$on("landing_company", (e, landingCompany) => {
        //     $scope.$applyAsync(() => {
        //         if (
        //             landingCompany.hasOwnProperty("mt_financial_company") &&
        //             clientService.isLandingCompanyOf('vanuatu', landingCompany.mt_financial_company.shortcode)
        //         ) {
        //             vm.hasMTAccess = true;
        //             websocketService.sendRequestFor.mt5LoginList();
        //         } else {
        //             vm.hasMTAccess = false;
        //         }
        //     });
        // });
        //
        // $scope.$on("mt5_login_list:success", (e, list) => {
        //     $scope.$applyAsync(() => {
        //         vm.mt5LoginList = list;
        //         vm.loadAccount(vm.accountType.demo);
        //     });
        // });
        //
        // $scope.$on("mt5_get_settings:success", (e, settings) => {
        //     $scope.$applyAsync(() => {
        //         vm.settings = settings;
        //     });
        // });
        //
        // vm.createMTAccount = () => {
        //     window.open(`https://www.binary.com/en/user/metatrader.html`, "_system");
        // };
        //
        // vm.loadAccount = accountName => {
        //     if (vm.mt5LoginList.length > 0) {
        //         const account = _.find(vm.mt5LoginList, o => {
        //             if (o.group) {
        //                 return o.group.indexOf(accountName) > -1;
        //             }
        //             return null;
        //         });
        //         if (account) {
        //             websocketService.sendRequestFor.mt5GetSettings(account.login);
        //             $scope.$applyAsync(() => {
        //                 vm.upgradeYourAccount = false;
        //             });
        //         } else {
        //             $scope.$applyAsync(() => {
        //                 vm.upgradeYourAccount = true;
        //             });
        //         }
        //         $scope.$applyAsync(() => {
        //             vm.openCard = accountName;
        //             vm.settings = null;
        //         });
        //     }
        // };
        //
        // vm.openMT5 = type => {
        //     type = type || "_blank";
        //     if (["android", "ios"].indexOf(ionic.Platform.platform()) > -1) {
        //         $state.go("mt5-web", { id: vm.settings.login });
        //         return;
        //     }
        //
        //     let url = "https://trade.mql5.com/trade?servers=Binary.com-Server&trade_server=Binary.com-Server&login=";
        //     url += vm.settings.login;
        //     window.open(url, type);
        // };
        //
        // const init = () => {
        //     const accounts = accountService.getAll();
        //     vm.hasRealAccount = !!_.find(accounts, obj =>
        //       _.indexOf(['malta', 'costarica', 'iom'], obj.landing_company_name) > -1);
        //
        //     const account = accountService.getDefault();
        //     if (account) {
        //         websocketService.sendRequestFor.landingCompanySend(account.country);
        //     }
        // };
        //
        // init();

    }
})();
