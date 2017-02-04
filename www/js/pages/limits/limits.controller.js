/**
 * @name Limits controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/18/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.limits.controllers')
        .controller('LimitsController', Limits);

    Limits.$inject = ['$scope', '$state', 'websocketService', 'accountService', 'appStateService'];

    function Limits($scope, $state, websocketService, accountService, appStateService) {
			var vm = this;
			vm.limits = {};
      vm.loginId = accountService.getDefault().id;
			websocketService.sendRequestFor.accountLimits();
			$scope.$on('get_limits', (e, get_limits) => {
				$scope.$applyAsync(() => {
					vm.limits = get_limits;
				});
			});

      vm.currency = (vm.loginId.search('MLT') > -1 || vm.loginId.search('MF') > -1 || vm.loginId.search('MX') > -1) ? 'EUR' : (sessionStorage.getItem('currency') || 'USD');

      $scope.$on('authorize', () => {
        if(appStateService.limitsChange) {
          appStateService.virtuality ? $state.go('trade') : $state.reload();
          appStateService.limitsChange = false;
        }
      });

    }
})();
