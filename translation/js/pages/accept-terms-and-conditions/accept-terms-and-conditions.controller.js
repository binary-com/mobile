/**
 * @name accept terms and conditions controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 12/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.accept-terms-and-conditions.controllers')
        .controller('AcceptTermsAndConditionsController', AcceptTermsAndConditions);

    AcceptTermsAndConditions.$inject = ['$scope', '$state', 'websocketService', 'alertService', 'appStateService'];

    function AcceptTermsAndConditions($scope, $state, websocketService, alertService, appStateService) {
        var vm = this;
        vm.data = {};
        vm.data.landingCompanyName = localStorage.getItem('landingCompanyName');
        vm.data.linkToTermAndConditions = "https://www.binary.com/" + (localStorage.getItem('language') || "en") + "/terms-and-conditions.html";

        vm.updateUserTermsAndConditions = function(){
          websocketService.sendRequestFor.TAndCApprovalSend();
        }

        vm.openTermsAndConditions = function(){
          window.open(vm.data.linkToTermAndConditions, '_blank');	
        }

        $scope.$on('tnc_approval', (e, tnc_approval) => {
          if(tnc_approval == 1){
            $state.go('trade');
          }
        });

        $scope.$on('tnc_approval:error', (e, error) => {
          alertService.displayError(error.message);
        });
    }
})();
