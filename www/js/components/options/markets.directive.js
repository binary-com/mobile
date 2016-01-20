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
		'alertService',
		function(marketService, proposalService, alertService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/markets.template.html',
			link: function(scope, element) {
				scope.showSymbolWarning = true;

				/**
				 * Get all symbols for the selected market
				 * @param  {String} _market Selected Market
				 */
				var updateSymbols = function(_market) {
					scope.symbols = marketService.getAllSymbolsForAMarket(_market);
					//marketService.getActiveTickSymbolsForMarket(_market);
					if (scope.symbols.length > 0) {
						scope.$parent.selected.symbol = marketService.getDefault.symbol(_market, scope.symbols);
						marketService.getSymbolDetails(scope.$parent.selected.symbol);
					}
					else{
						// If there is not any symbol that has tick support, a empty array broadcast for symbol
						scope.$parent.$broadcast('symbol', []);

						if(scope.showSymbolWarning){
							scope.showSymbolWarning = false;
							alertService.displaySymbolWarning('alert.no_underlying');
							scope.$watch(function(){ return scope.$parent.selected.market;}, function(newVal, oldVal){
								if(newVal !== oldVal)
									scope.showSymbolWarning = true;
							});
						}
					}

					if(!scope.$$phase) {
						scope.$apply();
					}
				};

				/**
				 * init function - to run on the page load
				 * Get forex and random markets
				 * Set the default/selected market
				 */
				var init = function() {
					try{
						marketService.fixOrder();
						var markets = marketService.getActiveMarkets();
						scope.market = {
							//forex: markets.indexOf('forex') !== -1  ? true : false,
							random: markets.indexOf('random') !== -1 ? true : false
						};

						scope.$parent.selected.market = marketService.getDefault.market(scope.market);


						updateSymbols(scope.$parent.selected.market);

						if(!scope.$$phase) {
							scope.$apply();
						}
					}
					catch(error){
						console.log(error);
					}


				};

				//init();

				scope.$on('symbols:updated', function(e, _symbol) {
					init();
				});

				scope.$on('assetIndex:updated', function(e, _symbol){
					//updateSymbols(scope.$parent.selected.market);
					init();
				});

				scope.updateMarket = function(_market) {
					// To disable "Let's trade" button until all data is loaded
					scope.isDataLoaded = false;

					scope.$parent.selected.market = _market;
					updateSymbols(scope.$parent.selected.market);
				};
			}
		};
	}]);
