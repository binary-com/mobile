/**
 * @name payoutStakeOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('payoutStakeOption',[
		'marketService',
		function(marketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/payout-stake.template.html',
			link: function(scope, element) {
				scope.$parent.selected.basis = marketService.getDefault.basis();
				scope.updateBasis = function(_basis) {
					scope.$parent.selected.basis = _basis;
				};
			}
		};
	}]);
