/**
 * @name Check Financial Assessment controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/16/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.check-financial-assessment.controllers')
        .controller('CheckFinancialAssessmentController', CheckFinancialAssessment);

    CheckFinancialAssessment.$inject = ['$scope', '$state', 'websocketService', 'appStateService'];

    function CheckFinancialAssessment($scope, $state, websocketService, appStateService) {
        var vm = this;
        $scope.$on('authorize', () => {
          websocketService.sendRequestFor.getAccountStatus();
        });
        $scope.$on('get_account_status', (e, get_account_status) => {
          if(get_account_status.risk_classification === 'high'){
            appStateService.hasToFillFinancialAssessment = true;
            websocketService.sendRequestFor.getFinancialAssessment();
          }
        });

        $scope.$on('get_financial_assessment:success', (e, get_financial_assessment) => {
          if(_.isEmpty(get_financial_assessment) && appStateService.hasToFillFinancialAssessment) {
            if(!appStateService.hasToAcceptTandC){
              $state.go('financial-assessment');
            }
          }
        });


    }
})();
