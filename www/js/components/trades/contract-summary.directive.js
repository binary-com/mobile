/**
 * @name contractSummary
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('contractSummary',[
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/contract-summary.template.html',
			link: function(scope, element) {

			}
		};
	}]);



















