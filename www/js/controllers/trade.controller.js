/**
 * @name TradeController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles trade's functionalities
 */

angular
	.module('binary')
	.controller('TradeController',
		function($scope, $state) {

			$scope.displayOptions = function($event) {
				$state.go('options');
			};

			$scope.purchase = function() {
				$state.go('contract');
			};

			$scope.logout = function() {
				$state.go('signin');
			};

	});
