/**
 * @name account categorisation controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 06/17/2018
 * @copyright Binary Ltd
 */

(function() {
    angular
      .module("binary.pages.account-categorisation.controllers")
      .controller("AccountCategorisationController", AccountCategorisation);

    AccountCategorisation.$inject = ["$scope", "$state", "$timeout", "websocketService", "accountService", "clientService", "alertService"];

    function AccountCategorisation($scope, $state, $timeout, websocketService, accountService, clientService, alertService) {
        const vm = this;
        vm.isDataLoaded = false;
        vm.userState = '';

        const hasValueIn = (arr, val) => _.indexOf(arr, val) > -1;
        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        vm.openProfessionalClientInformation = () => {
            alertService.showProfessioanlClientInformation($scope);
        };

        $scope.$on('get_account_status', (e, message) => {
            vm.isDataLoaded = true;
            const status = message.status;
            if (status) {
                if (hasValueIn(status, 'professional')) {
                    vm.userState = 'professional';
                } else if (hasValueIn(status, 'professional_requested')) {
                    vm.userState = 'processing';
                } else {
                    vm.userState = 'retail';
                }
            } else {
                vm.hasError = true;
            }
            $scope.$apply();
        });

        const init = () => {
            const account = accountService.getDefault();
            if (account) {
                const landingcompany = account.landing_company_name;
                const isFinancial = isLandingCompanyOf('maltainvest', landingcompany);
                if (isFinancial) {
                    websocketService.sendRequestFor.getAccountStatus();
                } else {
                    $state.go('trade');
                }
            } else {
                $timeout(init, 1000);
            }
        };

        init();
        // TODO:   also should reinit after set settings and after authorize of changing account
    }
})();
