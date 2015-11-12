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
		'config',
		function(marketService, config) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/symbols.template.html',
			link: function(scope, element) {
				scope.$on('symbol', function(e, response) {
					var tradeTypes = config.tradeTypes;
					scope.tradeTypes = [];

					if (response) {
						tradeTypes.forEach(function(el, i) {
							for (var key in response) {
								if (response.hasOwnProperty(key)) {
									if (el.value === key) {
										scope.tradeTypes.push(el);
									}
								}
							}
						});
					}
					scope.$parent.selected.tradeType = scope.tradeTypes[0].value;
					scope.$apply();
				});

				scope.updateSymbol = function(_selectedSymbol) {
					scope.$parent.selected.symbol = _selectedSymbol;
					marketService.getSymbolDetails(scope.$parent.selected.symbol);
				};

				// scope.$parent.$watch('selected.market', function(value){
				// 	console.log('selected.market.lah: ', value);
				// 	if (!scope.$parent.selected.symbol) {
				// 		scope.$parent.selected.symbol = scope.symbols[0].symbol;
				// 	}
				// });

			}
		};
	}]);
