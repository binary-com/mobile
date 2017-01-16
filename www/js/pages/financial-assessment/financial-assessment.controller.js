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

    FinancialAssessment.$inject = ['$scope', 'websocketService'];

    function FinancialAssessment($scope, websocketService) {
        var vm = this;
        vm.data = {};
        vm.disableUpdate = true;

        websocketService.sendRequestFor.getFinancialAssessment();
        $scope.$on('get_financial_assessment:success', (e, financial_assessment) => {
            $scope.$applyAsync(() => {
                if (!_.isEmpty(financial_assessment)) {
                    vm.data.commoditiesTradingExperience = financial_assessment.commodities_trading_experience;
                    vm.data.commoditiesTradingFrequency = financial_assessment.commodities_trading_frequency;
                    vm.data.educationLevel = financial_assessment.education_level;
                    vm.data.employmentIndustry = financial_assessment.employment_industry;
                    vm.data.estimatedWorth = financial_assessment.estimated_worth;
                    vm.data.forexTradingExperience = financial_assessment.forex_trading_experience;
                    vm.data.forexTradingFrequency = financial_assessment.forex_trading_frequency;
                    vm.data.incomeSource = financial_assessment.income_source;
                    vm.data.indicesTradingExperience = financial_assessment.indices_trading_experience;
                    vm.data.indicesTradingFrequency = financial_assessment.indices_trading_frequency;
                    vm.data.netIncome = financial_assessment.net_income;
                    vm.data.otherDerivativesTradingExperience = financial_assessment.other_derivatives_trading_experience;
                    vm.data.otherDerivativesTradingFrequency = financial_assessment.other_derivatives_trading_frequenc;
                    vm.data.otherInstrumentsTradingExperience = financial_assessment.other_instruments_trading_experience;
                    vm.data.otherInstrumentsTradingFrequency = financial_assessment.other_instruments_trading_frequency;
                    vm.data.stocksTradingExperience = financial_assessment.stocks_trading_experience;
                    vm.data.stocksTradingFrequency = financial_assessment.stocks_trading_frequency;
                    vm.disableUpdate = false;
                }
            });
        });

        vm.selectChanged = function() {
            vm.selectBoxesError = [
                vm.data.forexTradingExperience,
                vm.data.forexTradingFrequency, vm.data.indicesTradingExperience,
                vm.data.indicesTradingFrequency, vm.data.commoditiesTradingExperience,
                vm.data.stocksTradingExperience, vm.data.stocksTradingFrequency,
                vm.data.otherDerivativesTradingExperience, vm.data.otherDerivativesTradingFrequency,
                vm.data.otherInstrumentsTradingExperience, vm.data.otherInstrumentsTradingFrequency,
                vm.data.employmentIndustry, vm.data.educationLevel, vm.data.incomeSource,
                vm.data.netIncome,
                vm.data.estimatedWorth
            ];
            vm.disableUpdate = vm.selectBoxesError.some(element => !angular.isDefined(element)) ? true : false;
        }

        vm.submitFinancialAssessment = function() {

        }


    }
})();
