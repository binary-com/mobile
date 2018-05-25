/**
 * @name Financial Assessment controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/15/2017
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.pages.financial-assessment.controllers")
        .controller("FinancialAssessmentController", FinancialAssessment);

    FinancialAssessment.$inject = [
        "$scope",
        "$translate",
        "websocketService",
        "alertService",
        "clientService",
        "financialInformationOptions"
    ];

    function FinancialAssessment($scope,
        $translate,
        websocketService,
        alertService,
        clientService,
        financialInformationOptions) {
        const vm = this;
        const landingCompany = localStorage.getItem('landingCompany');
        vm.isFinancial = clientService.isAccountOfType('financial', landingCompany);
        vm.errors = {};
        vm.options = financialInformationOptions;
        vm.disableUpdateButton = false;
        vm.notAnyChanges = false;
        vm.isDataLoaded = false;
        vm.data = {
            'education_level'    : '',
            'employment_industry': '',
            'estimated_worth'    : '',
            'income_source'      : '',
            'employment_status'  : '',
            'net_income'         : '',
            'occupation'         : '',
            'source_of_wealth'   : '',
            'account_turnover'   : ''
        };
        const financialAssessmentData = {
            'forex_trading_experience'            : '',
            'forex_trading_frequency'             : '',
            'other_instruments_trading_experience': '',
            'other_instruments_trading_frequency' : '',
            'binary_options_trading_experience'   : '',
            'binary_options_trading_frequency'    : '',
            'cfd_trading_experience'              : '',
            'cfd_trading_frequency'               : ''
        };

        $scope.$on("get_financial_assessment:success", (e, financial_assessment) => {
            vm.financialAssessment = _.clone(financial_assessment);
            _.forEach(vm.data, (val, k) => vm.data[k] = financial_assessment[k]);
            vm.isDataLoaded = true;
            $scope.$apply();
        });

        vm.submitFinancialAssessment = () => {
            vm.errors = {};
            vm.notAnyChanges = !_.some(vm.data, (val, key) => vm.financialAssessment[key] !== vm.data[key]);
            if (!vm.notAnyChanges) {
                vm.disableUpdateButton = true;
                websocketService.sendRequestFor.setFinancialAssessment(vm.data);
            }
        };

        $scope.$on("set_financial_assessment:success", (e, set_financial_assessment) => {
            if (set_financial_assessment) {
                alertService.displayAlert(
                    $translate.instant('financial-assessment.success'),
                    $translate.instant('financial-assessment.success_message')
                );
            }
            websocketService.sendRequestFor.getFinancialAssessment();
            vm.disableUpdateButton = false;
        });

        $scope.$on("set_financial_assessment:error", (e, error) => {
            vm.disableUpdateButton = false;
            if (error.hasOwnProperty("details")) {
                $scope.$applyAsync(() => {
                    vm.errors = error.details;
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        const init = () => {
            if (vm.isFinancial) {
                _.assign(vm.data, financialAssessmentData);
            }
            websocketService.sendRequestFor.getFinancialAssessment();
        }

        init();
    }
})();
