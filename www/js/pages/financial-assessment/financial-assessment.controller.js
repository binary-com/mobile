/**
 * @name Financial Assessment controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/15/2017
 * @copyright Binary Ltd
 */

(function () {
    'use strict';

    angular
        .module('binary.pages.financial-assessment.controllers')
        .controller('FinancialAssessmentController', FinancialAssessment);

    FinancialAssessment.$inject = ['$scope', '$state', '$translate', 'websocketService', 'appStateService', 'alertService'];

    function FinancialAssessment($scope, $state, $translate, websocketService, appStateService, alertService) {
        var vm = this;
        vm.data = {};
        vm.disableUpdateButton = true;
        vm.changed = false;
        vm.notAnyChanges = false;
        vm.disableUpdateButton = false;
        vm.selectBoxesError = [];
        vm.requestData = [
            'commodities_trading_experience',
            'commodities_trading_frequency',
            'education_level',
            'employment_industry',
            'estimated_worth',
            'forex_trading_experience',
            'forex_trading_frequency',
            'income_source',
            'indices_trading_experience',
            'indices_trading_frequency',
            'net_income',
            'other_derivatives_trading_experience',
            'other_derivatives_trading_frequency',
            'other_instruments_trading_experience',
            'other_instruments_trading_frequency',
            'stocks_trading_experience',
            'stocks_trading_frequency',
            'occupation',
            'account_turnover'
        ];

        // set all errors to false
        vm.resetAllErrors = function() {
            _.forEach(vm.requestData, (value, key) => {
                var errorName = _.camelCase(value) + 'Error';
                vm[errorName] = false;
            });
        }

        vm.resetAllErrors();

        $scope.$on('authorize', () => {
            if (appStateService.redirectFromFinancialAssessment) {
                appStateService.redirectFromFinancialAssessment = false;
                $state.go('trade');
            }
        });

        websocketService.sendRequestFor.getFinancialAssessment();
        $scope.$on('get_financial_assessment:success', (e, financial_assessment) => {
            vm.financialAssessment = financial_assessment;
            $scope.$applyAsync(() => {
                if (!_.isEmpty(vm.financialAssessment)) {
                    _.forEach(vm.requestData, (value, key) => {
                        vm.data[_.camelCase(value)] = vm.financialAssessment[value];
                    });
                    vm.disableUpdateButton = false;
                }
            });
        });

        vm.submitFinancialAssessment = function() {
            vm.resetAllErrors();
            vm.params = {};
            vm.notAnyChanges = true;
            _.forEach(vm.data, (value, key) => {
                vm.params[_.snakeCase(key)] = vm.data[key];
                if (vm.data[key] !== vm.financialAssessment[_.snakeCase(key)]) {
                    vm.notAnyChanges = false;
                }
            });
            if (!vm.notAnyChanges) {
              vm.disableUpdateButton = true;
                websocketService.sendRequestFor.setFinancialAssessment(vm.params);
            }
        }

        $scope.$on('set_financial_assessment:success', (e, set_financial_assessment) => {
            $scope.$applyAsync(() => {
              if (set_financial_assessment) {
                  $translate(['financial-assessment.success', 'financial-assessment.success_message'])
                      .then((translation) => {
                          alertService.displayAlert(translation['financial-assessment.success'],
                              translation['financial-assessment.success_message']);
                      });
              }
            });
            websocketService.sendRequestFor.getFinancialAssessment();
            vm.disableUpdateButton = false;
        });

        $scope.$on('set_financial_assessment:error', (e, error) => {
          vm.disableUpdateButton = false;
            if (error.hasOwnProperty('details')) {
                $scope.$applyAsync(() => {
                    _.forEach(vm.requestData, (value, key) => {
                        if (error.details.hasOwnProperty(value)) {
                            var errorName = _.camelCase(value) + 'Error';
                            var errorMessageName = _.camelCase(value) + 'ErrorMessage';
                            vm[errorName] = true;
                            vm[errorMessageName] = error.details[value];
                        }
                    });
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

    }
})();
