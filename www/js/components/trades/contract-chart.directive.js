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
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/contract-chart.template.html',
			link: function(scope, element) {
				scope.$parent.$watch('tick', function(_tick){
					console.log('current tick: ', _tick);
				});
			}
		};
	}]);
