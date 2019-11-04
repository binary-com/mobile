/**
 * @name Limits controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/18/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.limits.controllers").controller("LimitsController", Limits);

    Limits.$inject = ["$scope", "$state", "websocketService", "accountService", "appStateService", "clientService"];

    function Limits($scope, $state, websocketService, accountService, appStateService, clientService) {
        const vm = this;
        vm.limits = {};
        vm.isDataLoaded = false;
        const account = accountService.getDefault();
        vm.loginid = account.id;
        const landingCompany = account.landing_company_name;
        vm.currency = account.currency && account.currency.length ? account.currency
            : clientService.landingCompanyValue(landingCompany, 'legal_default_currency');

        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        websocketService.sendRequestFor.accountLimits();
        $scope.$on("get_limits", (e, get_limits) => {
            $scope.$applyAsync(() => {
                vm.limits = get_limits;
                if (vm.limits.lifetime_limit === 99999999 && vm.limits.num_of_days_limit === 99999999) {
                    // fully aithenticated
                    vm.fullyAuthenticated = true;
                    vm.mxAccount = false;
                    vm.crAccount = false;
                    vm.otherAccount = false;
                } else if (isLandingCompanyOf('iom', landingCompany)) {
                    // MX accounts
                    vm.mxAccount = true;
                    vm.fullyAuthenticated = false;
                    vm.crAccount = false;
                    vm.otherAccount = false;
                } else if (isLandingCompanyOf('costarica', landingCompany) || isLandingCompanyOf('svg', landingCompany)) {
                    // CR accounts
                    vm.crAccount = true;
                    vm.fullyAuthenticated = false;
                    vm.mxAccount = false;
                    vm.otherAccount = false;
                } else {
                    vm.otherAccount = true;
                    vm.fullyAuthenticated = false;
                    vm.mxAccount = false;
                    vm.crAccount = false;
                }
            });
            vm.isDataLoaded = true;
        });

        $scope.$on("authorize", () => {
            if (appStateService.limitsChange) {
                if(appStateService.virtuality) {
                    $state.go("trade");
                } else {
                    $state.reload();
                }
                appStateService.limitsChange = false;
            }
        });

        vm.getLanguageId = title => `limits.${title.replace(/[\s]/g, '_').toLowerCase()}`;

    }
})();
