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
		'alertService',
		function(marketService, alertService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/markets.template.html',
			link: function(scope, element, attrs) {
				scope.showSymbolWarning = true;

				/**
				 * Get all symbols for the selected market
				 * @param  {String} _market Selected Market
				 */
				var updateSymbols = function(_market) {
                    scope.$applyAsync(function(){
                        scope.symbols = marketService.getAllSymbolsForAMarket(_market);
                        if (scope.symbols.length > 0) {
                            scope.$parent.selected.symbol = marketService.getDefault.symbol(_market, scope.symbols);
                            marketService.getSymbolDetails(scope.$parent.selected.symbol);
                        }
                        else{
                            // If there is not any symbol that has tick support, a empty array broadcast for symbol
                            scope.$broadcast('symbol', []);

                            if(scope.showSymbolWarning){
                                scope.showSymbolWarning = false;
                                alertService.displaySymbolWarning('alert.no_underlying');
                                scope.$watch(function(){ return scope.$parent.selected.market;}, function(newVal, oldVal){
                                    if(newVal !== oldVal)
                                        scope.showSymbolWarning = true;
                                });
                            }
                        }
                    });
					
				};

				/**
				 * init function - to run on the page load
				 * Get forex and random markets
				 * Set the default/selected market
				 */
				var init = function() {
					if( marketService.hasActiveSymobols() && marketService.hasAssetIndex() ){
						try{
                            scope.$applyAsync(function(){
                                marketService.fixOrder();
                                var markets = marketService.getActiveMarkets();
                                scope.market = {
                                    forex: markets.indexOf('forex') !== -1  ? true : false,
                                };

                                if(markets.indexOf('volidx') >= 0){
                                    scope.market.volidx = true;
                                }
                                else if(markets.indexOf('random') >= 0){
                                    scope.market.random = true;
                                }

                                scope.$parent.selected.market = marketService.getDefault.market(scope.market);


                                updateSymbols(scope.$parent.selected.market);
                            });

						}
						catch(error){
							console.log(error);
						}
					}
				};

				init();

				scope.$on('symbols:updated', function(e, _symbol) {
    					init();
				});

				scope.$on('assetIndex:updated', function(e, _symbol){
    					init();
				});

				scope.updateMarket = function(_market) {
					// To disable "Let's trade" button until all data is loaded
					scope.setDataLoaded(false);

					scope.$parent.selected.market = _market;
					updateSymbols(scope.$parent.selected.market);
				};
                
                scope.getNgDisabled = function(){
                    if(attrs['ngDisabled']){
                        return scope.$eval(attrs['ngDisabled']);
                    }
                    return false;
                };

                scope.isRandom = function(){
                    var markets = marketService.getActiveMarkets();
                    return markets.indexOf('random') > -1;
                }

			}
		};
	}]);
