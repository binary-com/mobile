/**
 * @name tradeTypesOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeTypesOption',[
		'marketService',
		'config',
		'$ionicScrollDelegate',
		function(marketService, config, $ionicScrollDelegate) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/trade-types.template.html',
			link: function(scope, element) {
				scope.$parent.$watch('selected', function(value){
					if (value.tradeType) {
						scope.updateTradeType(value.tradeType);
					}
				}, true);


				scope.updateTradeType = function(_tradeType) {
					scope.$parent.selected.tradeType = _tradeType;

					scope.$parent.displayDigits = false;
					var tradeTypes = config.tradeTypes;
					tradeTypes.forEach(function(el, i) {
						if (el.value === _tradeType && el.digits === true) {
							scope.$parent.displayDigits = true;
						}
					});
				};

				scope.$parent.$watch(function(){
					var digitsVisible = angular.element(document).find('digits-option').hasClass('ng-hide');
					return digitsVisible;
				}, function(){
					$ionicScrollDelegate.resize();
				}, false);
			}
		};
	}]);
