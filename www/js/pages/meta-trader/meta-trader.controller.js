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
        vm.upgradeYourAccount = false;
        vm.hasRealAccount = false;

        vm.accountType = {
            demo      : "demo\\binary_virtual",
            volatility: "real\\costarica",
            financial : "real\\vanuatu_cent"
        };

        $scope.$on("landing_company", (e, landingCompany) => {
            $scope.$applyAsync(() => {
                if (
                    landingCompany.hasOwnProperty("mt_financial_company") &&
                    clientService.isLandingCompanyOf('vanuatu', landingCompany.mt_financial_company.shortcode)
                ) {
                    vm.hasMTAccess = true;
                    websocketService.sendRequestFor.mt5LoginList();
                } else {
                    vm.hasMTAccess = false;
                }
            });
        });

        $scope.$on("mt5_login_list:success", (e, list) => {
            $scope.$applyAsync(() => {
                vm.mt5LoginList = list;
                vm.loadAccount(vm.accountType.demo);
            });
        });

        $scope.$on("mt5_get_settings:success", (e, settings) => {
            $scope.$applyAsync(() => {
                vm.settings = settings;
            });
        });

        vm.createMTAccount = section => {
            window.open(`https://mt.binary.com/en/user/settings/metatrader.html#${section}`, "_system");
        };

        vm.loadAccount = accountName => {
            if (vm.mt5LoginList.length > 0) {
                const account = _.find(vm.mt5LoginList, o => {
                    if (o.group) {
                        return o.group.indexOf(accountName) > -1;
                    }
                    return null;
                });
                if (account) {
                    websocketService.sendRequestFor.mt5GetSettings(account.login);
                    $scope.$applyAsync(() => {
                        vm.upgradeYourAccount = false;
                    });
                } else {
                    $scope.$applyAsync(() => {
                        vm.upgradeYourAccount = true;
                    });
                }
                $scope.$applyAsync(() => {
                    vm.openCard = accountName;
                    vm.settings = null;
                });
            }
        };

        vm.openMT5 = type => {
            type = type || "_blank";
            if (["android", "ios"].indexOf(ionic.Platform.platform()) > -1) {
                $state.go("mt5-web", { id: vm.settings.login });
                return;
            }

            let url = "https://trade.mql5.com/trade?servers=Binary.com-Server&trade_server=Binary.com-Server&login=";
            url += vm.settings.login;
            window.open(url, type);
        };

        init();

        function init() {
            const accounts = accountService.getAll();
            vm.hasRealAccount = !!_.find(accounts, obj =>
                _.indexOf(['malta', 'costarica', 'iom'], obj.landing_company_name) > -1);

            const account = accountService.getDefault();
            if (account) {
                websocketService.sendRequestFor.landingCompanySend(account.country);
            }
        }
    }
})();
