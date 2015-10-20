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
		function($scope, $state) {

			$scope.goToManageAccounts = function() {
				$state.go('accounts');
			};

			$scope.backToTradePage = function() {
				$state.go('trade');
			};


			// Update values
			$scope.updateTicks = function(_tick) {
				console.log('tick number: ', _tick);
			};
			$scope.updateBasis = function(_basis) {
				console.log('basis: ', _basis);
			};




	});
