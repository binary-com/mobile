/**
 * @name header controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/08/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.share.components").controller("HeaderController", Header);

    Header.$inject = ["$scope", "$state", "$ionicHistory", "$ionicSideMenuDelegate", "appStateService", "clientService"];

    function Header($scope, $state, $ionicHistory, $ionicSideMenuDelegate, appStateService, clientService) {
        const vm = this;
        vm.hideMenuButton = false;
        vm.hideBalance = false;
        vm.disableMenuButton = false;
        vm.disableBackButton = false;
        vm.showBack = false;
        $ionicSideMenuDelegate.canDragContent(false);
        $ionicHistory.backView(null);
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.isMaltainvest = appStateService.isMaltainvest;

        vm.toggleSideMenu = function() {
            if (appStateService.tradeMode || !appStateService.purchaseMode) {
                $ionicSideMenuDelegate.toggleLeft();
            }
        };

        $scope.$watch(
            () => appStateService.purchaseMode,
            () => {
                vm.disableMenuButton = appStateService.purchaseMode;
            }
        );

        $scope.$watch(
            () => appStateService.passwordChanged,
            () => {
                vm.disableBackButton = appStateService.passwordChanged;
            }
        );

        $scope.$on("$stateChangeSuccess", (ev, to, toParams, from, fromParams) => {
            vm.to = to;
            vm.from = from;
            vm.hideBalance = false;
            if (
                [
                    "transaction-detail",
                    "language",
                    "profile",
                    "self-exclusion",
                    "change-password",
                    "trading-times",
                    "asset-index",
                    "limits",
                    "financial-assessment",
                    "terms-and-conditions",
                    "authentication"
                ].indexOf(vm.to.name) > -1
            ) {
                vm.hideMenuButton = true;
                vm.showBack = true;
            } else if (["mt5-web"].indexOf(vm.to.name) > -1) {
                vm.hideBalance = true;
            } else if (["contact"].indexOf(vm.to.name) > -1) {
                if (["authentication", "notifications"].indexOf(vm.from.name) > -1) {
                    vm.hideMenuButton = true;
                    vm.showBack = true;
                } else {
                    vm.hideMenuButton = false;
                    vm.showBack = false;
                }
            } else if (["real-account-opening", "maltainvest-account-opening"].indexOf(vm.to.name) > -1 &&
                appStateService.redirectedFromAccountsManagemenet) {
                if (["accounts-management"].indexOf(vm.from.name) > -1) {
                    vm.hideMenuButton = true;
                    vm.showBack = true;
                }
            } else {
                if (
                    vm.from.name === "statement" &&
                    vm.to.name !== "transaction-detail" &&
                    document.getElementsByClassName("reality-check").length > 0
                ) {
                    $(".popup-container").addClass("popup-showing");
                    $("body").addClass("popup-open");
                    $(".backdrop").addClass("visible");
                }
                vm.hideMenuButton = false;
                vm.showBack = false;
                if (vm.from.name === "profit-table") {
                    appStateService.isProfitTableSet = false;
                }
                if (vm.from.name === "statement") {
                    appStateService.isStatementSet = false;
                }
            }
        });

        $scope.$on('authorize', (e, authorize) => {
            if (authorize) {
                vm.isMaltainvest = clientService.isLandingCompanyOf('maltainvest', authorize.landing_company_name);
            }
        });

        // back button function
        vm.goToPrevPage = function() {
            if (vm.to.detailed) {
                $state.go("trade");
            } else {
                $state.go(vm.from);
                if (vm.to.name === 'real-account-opening' || vm.to.name === 'maltainvest-account-opening') {
                    appStateService.selectedCurrency = false;
                    appStateService.redirectedFromAccountsManagemenet = false;
                }
            }
        };
    }
})();
