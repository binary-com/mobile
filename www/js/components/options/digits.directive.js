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
				var hideDigit = function hideDigit(hideDigit) {
					var digitIndex = scope.digits.indexOf(hideDigit);
					if ( digitIndex < 0 ) {
						return;
					}
					scope.digits.splice(digitIndex, 1);
					if ( scope.$parent.selected.digit == hideDigit ) {
						scope.$parent.selected.digit = scope.digits[0];
					}
				};

				scope.digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
				scope.$parent.selected.digit = marketService.getDefault.digit();

				scope.$parent.$watch('hideDigit', function(value){
					if (scope.$parent != null) {
						scope.digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
						scope.$parent.selected.digit = marketService.getDefault.digit();

						if ( !isNaN(value) ) {
							hideDigit(parseInt(value));
						}
					}
				});

				scope.updateDigit = function(_digit) {
					scope.$parent.selected.digit = _digit;
				};
			}
		};
	}]);
