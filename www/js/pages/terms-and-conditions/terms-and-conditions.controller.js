/**
 * @name terms and conditions controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 12/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.terms-and-conditions.controllers')
        .controller('TermsAndConditionsController', TermsAndConditions);

    TermsAndConditions.$inject = ['$scope', '$state', 'websocketService', 'accountService', 'appStateService'];

    function TermsAndConditions($scope, $state, websocketService, accountService, appStateService) {
        var vm = this;
				$scope.$on('get_settings', (e, get_settings) => {
					vm.clientTncStatus = get_settings.client_tnc_status;
          vm.termsConditionsVersion = localStorage.getItem('termsConditionsVersion');
          if(!appStateService.virtuality && vm.clientTncStatus !== vm.termsConditionsVersion){
            $state.go('acceptTermsAndConditions');
            appStateService.hasToAcceptTandC = true;
          }
				});
    }
})();
