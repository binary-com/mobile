/**
 * @name marketsOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('marketsOption',[
		'marketService',
		function(marketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/markets.template.html',
			link: function(scope, element) {
				var updateSymbols = function(_market) {
					scope.symbols = marketService.getAllSymbolsForAMarket(_market);
					//console.log('market: ', _market);
					//console.log('symbols: ', scope.symbols);

					//if (!scope.$parent.selected.symbol) {
						scope.$parent.selected.symbol = scope.symbols[0].symbol;
					//}

					marketService.getSymbolDetails(scope.selected.symbol);
				};

				var init = function() {
					var markets = marketService.getActiveMarkets();
					scope.market = {
						forex: markets.indexOf('forex') !== -1  ? true : false,
						random: markets.indexOf('random') !== -1 ? true : false
					};

					if (!scope.$parent.selected.market) {
						scope.$parent.selected.market = 'forex';
					}
					//console.log('selected market: ', scope.$parent.selected);
					updateSymbols(scope.$parent.selected.market);
				};

				init();

				scope.updateMarket = function(_market) {
					scope.$parent.selected.market = _market;
					updateSymbols(scope.$parent.selected.market);

				};
			}
		};
	}]);
