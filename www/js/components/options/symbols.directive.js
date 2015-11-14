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

					var tradeTypes = config.tradeTypes;
					scope.tradeTypes = [];

					if (_symbol) {
						tradeTypes.forEach(function(el, i) {
							for (var key in _symbol) {
								if (_symbol.hasOwnProperty(key)) {
									if (el.value === key) {
										var hasTicks = false;
										for (var j = 0; j < _symbol[key].length; j++) {
											var minDuration = _symbol[key][j].min_contract_duration;
											if (minDuration.match(/^\d+$/)) {
												hasTicks = true;
											}
										}
										if (hasTicks) {
											scope.tradeTypes.push(el);
										}

									}
								}
							}
						});
					}
					if (scope.tradeTypes.length === 0) {
						$('.options-save button').attr("disabled", true);
						alertService.optionsError.noTick();
						return;
					}
					$('.options-save button').attr("disabled", false);
					scope.$parent.selected.tradeType = scope.tradeTypes[0].value;
					scope.$apply();
				});

				scope.updateSymbol = function(_selectedSymbol) {
					scope.$parent.selected.symbol = _selectedSymbol;
					marketService.getSymbolDetails(scope.$parent.selected.symbol);
				};
			}
		};
	}]);
