/**
 * @name Financial Assessment controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/15/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.financial-assessment.controllers')
        .controller('FinancialAssessmentController', FinancialAssessment);

    FinancialAssessment.$inject = ['$scope', '$state', '$timeout', 'websocketService', 'appStateService'];

    function FinancialAssessment($scope, $state, $timeout, websocketService, appStateService) {
        var vm = this;
        vm.data = {};
        vm.disableUpdate = true;
        vm.updateSuccessful = false;
        vm.changed = false;
        vm.notAnyChanges = false;
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
        'occupation'
        ];

        $scope.$on('authorize', () => {
          if(appStateService.redirectFromFinancialAssessment){
            appStateService.redirectFromFinancialAssessment = false;
            $state.go('trade');
          }
        });

        websocketService.sendRequestFor.getFinancialAssessment();
        $scope.$on('get_financial_assessment:success', (e, financial_assessment) => {
            $scope.$applyAsync(() => {
                if (!_.isEmpty(financial_assessment)) {
                  _.forEach(vm.requestData, (value, key) => {
                    vm.data[_.camelCase(value)] = financial_assessment[value];
                  });
                    vm.disableUpdate = false;
                }
            });
        });

        vm.selectChanged = function() {
          _.forEach(vm.requestData, (value, key) => {
            vm.selectBoxesError.push(_.camelCase(value));
          });
            vm.disableUpdate = vm.selectBoxesError.some(element => !angular.isDefined(element)) ? true : false;
            vm.changed = true;
        }

        vm.submitFinancialAssessment = function() {
            if (vm.changed) {
              vm.params = {};
              _.forEach(vm.data, (value, key) => {
                vm.params[_.snakeCase(key)] = vm.data[key];
              });
                websocketService.sendRequestFor.setFinancialAssessment(vm.params);
                vm.notAnyChanges = false;
            } else {
                vm.notAnyChanges = true;
            }
        }

        $scope.$on('set_financial_assessment:success', (e, set_financial_assessment) => {
            $scope.$applyAsync(() => {
                vm.updateSuccessful = true;
            });
        });

    }
})();
