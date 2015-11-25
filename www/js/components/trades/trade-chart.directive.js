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
		'websocketService', 'chartService', 
		function(websocketService, chartService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/trade-chart.template.html',
			link: function(scope, element) {

				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol;
					scope.chart = chartService.makeChart('#chart1');
					scope.$parent.chartDragLeft = scope.chart.previous;
					scope.$parent.chartDragRight = scope.chart.next;
					scope.$parent.chartTouch = scope.chart.dragStart;
					scope.$parent.chartRelease = scope.chart.dragEnd;
					scope.$parent.chartPinchIn = scope.chart.zoomOut;
					scope.$parent.chartPinchOut = scope.chart.zoomIn;
					scope.$parent.chartPinchStart = scope.chart.zoomStart;
					scope.$parent.chartPinchEnd = scope.chart.zoomEnd;

					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.ticksHistory(
						{
							"ticks_history": symbol,
							"end": "latest",
							"count": scope.chart.getCapacity() + 1,
							"subscribe": 1
						}
					);
				};

				init();

				scope.$on('tick', function(e, feed){
					if (feed){
						scope.chart.historyInterface.addTick(feed.tick);
					}
				});

				scope.$on('history', function(e, feed){
					if (feed){
						scope.chart.historyInterface.addHistory(feed.history);
					}
				});

				scope.$on('candles', function(e, feed){
					if (feed){
						scope.chart.historyInterface.addCandles(feed.candles);
					}
				});

				scope.$on('ohlc', function(e, feed){
					if (feed){
						scope.chart.historyInterface.addOhlc(feed.ohlc);
					}
				});
			}
		};
	}]);



















