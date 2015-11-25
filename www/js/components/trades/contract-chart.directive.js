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
				scope.chart = chartService.makeChart('#chart2');
				scope.$parent.chartDragLeft = scope.chart.previous;
				scope.$parent.chartDragRight = scope.chart.next;
				scope.$parent.chartTouch = scope.chart.dragStart;
				scope.$parent.chartRelease = scope.chart.dragEnd;
				scope.$parent.chartPinchIn = scope.chart.zoomOut;
				scope.$parent.chartPinchOut = scope.chart.zoomIn;
				scope.$parent.chartPinchStart = scope.chart.zoomStart;
				scope.$parent.chartPinchEnd = scope.chart.zoomEnd;
				var contractId = scope.$parent.contract.contract_id;
				scope.$on('portfolio', function(e, portfolio){
					portfolio.contracts.forEach(function(contract){
						if (contract.contract_id == contractId){
							console.log(new Date((contract.date_start+1)*1000));
						}
					});
				});
				var entrySpot = parseInt(scope.$parent.proposalRecieved.date_start),
						exitSpot = entrySpot + parseInt(scope.$parent.proposalToSend.duration);
				//console.log(scope.$parent.proposalRecieved);
				//console.log(scope.$parent.proposalToSend);
				scope.$on('tick', function(e, feed){
					scope.chart.historyInterface.addTick(feed.tick);
				});
				scope.$on('balance', function(e, proposalOpenContract){
					//console.log('current proposal: ', proposalOpenContract);
				});
			}
		};
	}]);
