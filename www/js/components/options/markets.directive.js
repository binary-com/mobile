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
					if (scope.symbols) {
						scope.$parent.selected.symbol = scope.symbols[0].symbol;
						marketService.getSymbolDetails(scope.selected.symbol);
					}
					if(!scope.$$phase) {
						scope.$apply();
					}
				};

				var init = function() {
					var markets = marketService.getActiveMarkets();
					scope.market = {
						forex: markets.indexOf('forex') !== -1  ? true : false,
						random: markets.indexOf('random') !== -1 ? true : false
					};

					scope.$parent.selected.market = scope.market.forex ? 'forex' : 'random';

					updateSymbols(scope.$parent.selected.market);
				};

				init();

				scope.$on('symbols:updated', function(e, _symbol) {
					init();
				});

				scope.updateMarket = function(_market) {
					scope.$parent.selected.market = _market;
					updateSymbols(scope.$parent.selected.market);
				};
			}
		};
	}]);
