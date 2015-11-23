/**
 * @name digitsOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('digitsOption',[
		'marketService',
		function(marketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/digits.template.html',
			link: function(scope, element) {
				scope.digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
				scope.$parent.selected.digit = marketService.getDefault.digit();

				scope.updateDigit = function(_digit) {
					scope.$parent.selected.digit = _digit;
				};
			}
		};
	}]);
