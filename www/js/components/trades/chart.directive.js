/**
 * @name chartTrade
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 * @description directive used to display the login form
 */

angular
	.module('binary')
	.directive('chartTrade',[
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/chart.template.html',
			link: function(scope, element) {

				scope.$parent.$watch('tick', function(value){
					console.log('current tick: ', value);
				});

			}
		};
	}]);



















