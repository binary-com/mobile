/**
 * @name changeAccount
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeOptions',[
		'accountService',
		'$state',
		function(accountService, $state) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trade-options.template.html',
			link: function(scope, element) {
				var init = function() {
					// get symbols
					websocketService.sendRequestFor.symbols();
					// get markets
				};


			}
		};
	}]);
