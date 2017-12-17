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
        "$state",
        "$translate",
        "websocketService",
        "appStateService",
        "alertService",
        "financialInformationOptions"
    ];

    function FinancialAssessment($scope,
                                 $state,
                                 $translate,
                                 websocketService,
                                 appStateService,
                                 alertService,
                                 financialInformationOptions) {
        const vm = this;
        vm.errors = {};
        vm.options = financialInformationOptions;
        vm.disableUpdateButton = false;
        vm.notAnyChanges = false;
        vm.data = {
          'commodities_trading_experience': '',
          'commodities_trading_frequency': '',
          'education_level': '',
          'employment_industry': '',
          'estimated_worth': '',
          'forex_trading_experience': '',
          'forex_trading_frequency': '',
          'income_source': '',
          'employment_status': '',
          'indices_trading_experience': '',
          'indices_trading_frequency': '',
          'net_income': '',
          'other_derivatives_trading_experience': '',
          'other_derivatives_trading_frequency': '',
          'other_instruments_trading_experience': '',
          'other_instruments_trading_frequency': '',
          'stocks_trading_experience': '',
          'stocks_trading_frequency': '',
          'occupation': '',
          'source_of_wealth': '',
          'account_turnover': ''
        };

        $scope.$on("get_financial_assessment:success", (e, financial_assessment) => {
            vm.financialAssessment = _.clone(financial_assessment);
            _.forEach(vm.data, (val, k) => vm.data[k] = financial_assessment[k]);
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
            $scope.$applyAsync(() => {
                if (set_financial_assessment) {
                    $translate([
                        "financial-assessment.success",
                        "financial-assessment.success_message"
                    ]).then(translation => {
                        alertService.displayAlert(
                            translation["financial-assessment.success"],
                            translation["financial-assessment.success_message"]
                        );
                    });
                }
            });
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

        const init = () => websocketService.sendRequestFor.getFinancialAssessment();

        init();
    }
})();
