/**
 * @name HomeController
 * @author Massih Hazrati
 * @contributors []
 * @since 11/16/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.controller('HomeController',
		function($scope, $state, websocketService, accountService) {
			var init = function() {
				websocketService.init();
				if (accountService.hasDefault()) {
					accountService.validate();
					websocketService.sendRequestFor.symbols();
				} else {
					$state.go('signin');
				}
			};

			init();

			$scope.$on('authorize', function(e, response) {
				if (response) {
					$state.go('options');
				} else {
					$state.go('signin');
				}
			});
	});
