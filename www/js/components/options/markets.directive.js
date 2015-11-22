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
		'proposalService',
		function(marketService, proposalService) {
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

				var getDefaultMarket = function() {
					var proposal = proposalService.get();
					if (proposal &&
						proposal.passthrough &&
						proposal.passthrough.market &&
						scope.market[proposal.passthrough.market]) {

						return proposal.passthrough.market;
					} else {
						return scope.market.forex ? 'forex' : 'random';
					}
				};


				/**
				 * init function - to run on the page load
				 * Get forex and random markets
				 *
				 */
				var init = function() {
					var markets = marketService.getActiveMarkets();
					scope.market = {
						forex: markets.indexOf('forex') !== -1  ? true : false,
						random: markets.indexOf('random') !== -1 ? true : false
					};

					scope.$parent.selected.market = getDefaultMarket();

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
