/**
 * @name ContractController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles contract's functionalites (portfolio)
 */

angular
	.module('binary')
	.controller('ContractController',
		function($scope, $state) {

		$scope.back = function() {
			$state.go('trade');
		};
	});
