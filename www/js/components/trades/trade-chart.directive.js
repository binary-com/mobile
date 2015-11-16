/**
 * @name tradeChart
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeChart',[
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/trade-chart.template.html',
			link: function(scope, element) {
				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol;

					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.ticksForSymbol(symbol);

					/**
					 * Format:
					 * websocketService.sendRequestFor.ticksHistory(symbol, startTime, granularity, count)
					 */
					websocketService.sendRequestFor.ticksHistory(symbol, '1447393442', 'M1', 10);
				};

				init();

				scope.$on('tick', function(e, _tick){
					if (_tick) {
						scope.tick = _tick;
					}
				});

				scope.$on('tickHistory', function(e, _tickHistory) {
					if (_tickHistory) {
						scope.tickHistory = _tickHistory;
					}
				});
			}
		};
	}]);



















