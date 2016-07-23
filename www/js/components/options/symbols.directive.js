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
			link: function(scope, element, attrs) {
                scope.tradeTypes = config.tradeTypes;

				scope.$on('symbol', function(e, _symbol) {
                    scope.$applyAsync(function(){
                        if (!_.isEmpty(_symbol)) {
                            scope.tradeTypes = marketService.getTradeTypes(_symbol);
                            scope.$parent.selected.tradeType = marketService.getDefault.tradeType(scope.tradeTypes);
                            
                            // Assigning "true" to isDataLoaded to enable "Let's trade" button
                            scope.setDataLoaded(true);

                        }
                        else{
                            
                            // Assigning "false" to isDataLoaded to disable "Let's trade" button
                            scope.setDataLoaded(true, false);
                            
                        }
                    });
					
				});

				scope.updateSymbol = function(_selectedSymbol) {
					scope.$parent.selected.symbol = _selectedSymbol;
					marketService.getSymbolDetails(scope.$parent.selected.symbol);
				};
                
                scope.getNgDisabled = function(){
                    if(attrs['ngDisabled']){
                        return scope.$eval(attrs['ngDisabled']);
                    }
                    return false;
                };
			}
		};
	}]);
