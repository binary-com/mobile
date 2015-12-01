/**
 * @name OptionsController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles changing contract's options
 */

angular
	.module('binary')
	.controller('OptionsController',
		function($scope, $rootScope, $state, config, proposalService, accountService, websocketService) {
			$scope.selected = {};

			//
			websocketService.sendRequestFor.symbols();

			$scope.navigateToManageAccounts = function() {
				$state.go('accounts');
			};

			$scope.navigateToTradePage = function() {
				$state.go('trade');
			};

			$scope.saveChanges = function() {
				var proposal = {
					symbol: $scope.selected.symbol,
					contract_type: $scope.selected.tradeType,
					duration: $scope.selected.tick,
					basis: $scope.selected.basis,
					currency: accountService.getDefault().currency,
					passthrough: {
						market: $scope.selected.market
					},
					digit: $scope.selected.digit,
					barrier: $scope.selected.barrier
				};

				proposalService.update(proposal);
				proposalService.send();

				$state.go('trade', {}, { reload: true, inherit: false, notify: true });
			};
	});

























