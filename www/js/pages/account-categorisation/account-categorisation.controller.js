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

    AccountCategorisation.$inject = ["$scope", "$state", "$timeout", "$translate", "websocketService", "accountService", "clientService", "alertService"];

    function AccountCategorisation($scope, $state, $timeout, $translate, websocketService, accountService,
        clientService, alertService) {
        const vm = this;
        let loginid = '';
        const params = {
            request_professional_status: 0,
            tax_identification_number  : '',
            tax_residence              : ''
        };

        const hasValueIn = (arr, val) => _.indexOf(arr, val) > -1;
        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        $scope.$on('set-settings:error', (e, error) => {
            if (error.code === 'InputValidationFailed') {
                $state.go('profile');
            } else {
                alertService.displayError(error.message);
            }
        });

        $scope.$on('set-settings', (e, message) => {
            init();
        });

        $scope.$on('get_settings', (e, get_settings) => {
            _.forEach(params, (val, k) => {
                if (get_settings[k]) params[k] = get_settings[k];
            });
            params.request_professional_status = 1;
            websocketService.sendRequestFor.setAccountSettings(params);
        });

        $scope.$on('authorize', (e, authorize) => {
            if (authorize && authorize.loginid !== loginid) {
                loginid = authorize.loginid;
                const isFinancial = isLandingCompanyOf('maltainvest', authorize.landing_company_name);
                if (!isFinancial) {
                    $state.go('trade');
                } else {
                    init();
                }
            }
        });

        vm.openProfessionalClientInformation = () => {
            alertService.showProfessioanlClientInformation($scope);
        };

        vm.updateClientType = () => {
            websocketService.sendRequestFor.accountSetting();
        };

        vm.showConfirmProfessionalClient = () => {
            if (vm.client_type) {
                alertService.displayProfessionalClientConfirmation(
                    $translate.instant('professional-client-confirmation.professional_clients'),
                    'information-popup',
                    $scope,
                    'js/share/templates/professional-client/professional-client-confirmation.template.html',
                    [
                        {
                            text : $translate.instant("professional-client-confirmation.decline"),
                            onTap: () => vm.client_type = 0
                        },
                        {
                            text : $translate.instant("professional-client-confirmation.accept"),
                            type : "button-positive",
                            onTap: () => true
                        }
                    ]
                );
            }
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
            vm.isDataLoaded = false;
            vm.userState = '';
            const account = accountService.getDefault();
            if (account) {
                loginid = account.id;
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
    }
})();
