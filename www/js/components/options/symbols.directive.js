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
						$('.options-save button').attr("disabled", true);
						//alertService.optionsError.noTick();
						return;
					}

					$('.options-save button').attr("disabled", false);
					scope.$parent.selected.tradeType = marketService.getDefault.tradeType(scope.tradeTypes);
					scope.$apply();
				});

				scope.updateSymbol = function(_selectedSymbol) {
					scope.$parent.selected.symbol = _selectedSymbol;
					marketService.getSymbolDetails(scope.$parent.selected.symbol);
				};
			}
		};
	}]);
