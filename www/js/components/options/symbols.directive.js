/**
 * @name symbolsOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('symbolsOption',[
		'marketService',
		'alertService',
		'config',
		function(marketService, alertService, config) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/symbols.template.html',
			link: function(scope, element) {
				scope.$on('symbol', function(e, _symbol) {
					if (_symbol) {
						scope.tradeTypes = marketService.getTradeTypes(_symbol);

					}

					if (scope.tradeTypes.length === 0) {
						
						// Assigning "false" to isDataLoaded to disable "Let's trade" button
						scope.isDataLoaded = false;
						
						return;
					}

					scope.$parent.selected.tradeType = marketService.getDefault.tradeType(scope.tradeTypes);
					
					// Assigning "true" to isDataLoaded to enable "Let's trade" button
					scope.$parent.isDataLoaded = true;
					
					scope.$apply();
				});

				scope.updateSymbol = function(_selectedSymbol) {
					scope.$parent.selected.symbol = _selectedSymbol;
					marketService.getSymbolDetails(scope.$parent.selected.symbol);
				};
			}
		};
	}]);
