/**
 * @name tradeContractChart
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeContractChart',[
		'websocketService', 'chartService',
		function(websocketService, chartService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/trade-contract-chart.template.html',
			link: function(scope, element) {
				var init = function() {
					var symbol = scope.$parent.proposalToSend.symbol;
					var chartID = 'tradeContractChart';
					chartService.drawChart(chartID);
					scope.$parent.chartDragLeft = chartService.dragLeft;
					scope.$parent.chartDragRight = chartService.dragRight;
					scope.$parent.chartTouch = chartService.dragStart;
					scope.$parent.chartRelease = chartService.dragEnd;
					scope.$parent.chartPinchIn = chartService.zoomOut;
					scope.$parent.chartPinchOut = chartService.zoomIn;
					scope.$parent.chartPinchStart = chartService.zoomStart;
					scope.$parent.chartPinchEnd = chartService.zoomEnd;
					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.ticksHistory(
						{
							"ticks_history": symbol,
							"end": "latest",
							"count": chartService.getCapacity(),
							"subscribe": 1
						}
					);
				};

				init();

				scope.$on('$destroy', function(e, value){
					chartService.destroy();
				});

				scope.$on('portfolio', function(e, portfolio){
					var contractId = scope.$parent.contract.contract_id;
					if ( typeof contractId !== 'undefined' ) {
						portfolio.contracts.forEach(function(contract){
							if (contract.contract_id == contractId){
								chartService.addContract({
									startTime: contract.date_start+1,
									duration: parseInt(scope.$parent.proposalToSend.duration),
									type: scope.$parent.proposalToSend.contract_type,
									barrier: scope.$parent.proposalToSend.barrier
								});
							}
						});
					}
				});

				scope.$on('tick', function(e, feed){
					if (feed && feed.echo_req.ticks_history === scope.$parent.proposalToSend.symbol){
						chartService.historyInterface.addTick(feed.tick);
					} else {
						websocketService.sendRequestFor.forgetStream(feed.tick.id);
					}
				});

				scope.$on('history', function(e, feed){
					if (feed && feed.echo_req.ticks_history === scope.$parent.proposalToSend.symbol){
						chartService.historyInterface.addHistory(feed.history);
					}
				});

				scope.$on('candles', function(e, feed){
					if (feed){
						chartService.historyInterface.addCandles(feed.candles);
					}
				});

				scope.$on('ohlc', function(e, feed){
					if (feed){
						chartService.historyInterface.addOhlc(feed.ohlc);
					}
				});

                scope.$on('connection:ready', function(e){
                    init();
                });

			}
		};
	}]);
