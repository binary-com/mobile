/**
 * @name contractChart
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('contractChart',[
		'websocketService', 'chartService',
		function(websocketService, chartService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/contract-chart.template.html',
			link: function(scope, element) {
				var contractId = scope.$parent.contract.contract_id;
				var init = function() {
					scope.chart = chartService.makeChart('#chartForContract');
					scope.$parent.chartDragLeft = scope.chart.previous;
					scope.$parent.chartDragRight = scope.chart.next;
					scope.$parent.chartTouch = scope.chart.dragStart;
					scope.$parent.chartRelease = scope.chart.dragEnd;
					scope.$parent.chartPinchIn = scope.chart.zoomOut;
					scope.$parent.chartPinchOut = scope.chart.zoomIn;
					scope.$parent.chartPinchStart = scope.chart.zoomStart;
					scope.$parent.chartPinchEnd = scope.chart.zoomEnd;
				};

				init();

				scope.$on('portfolio', function(e, portfolio){
					portfolio.contracts.forEach(function(contract){
						if (contract.contract_id == contractId){
							scope.chart.addContract({
								entrySpot: contract.date_start+1,
								duration: parseInt(scope.$parent.proposalToSend.duration),
								type: scope.$parent.proposalToSend.contract_type
							});
						}
					});
				});
				scope.$on('tick', function(e, feed){
					scope.chart.historyInterface.addTick(feed.tick);
				});
			}
		};
	}]);
