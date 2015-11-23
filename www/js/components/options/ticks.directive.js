/**
 * @name ticksOption
 * @author Massih Hazrati
 * @contributors []
 * @since 11/10/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('ticksOption',[
		'marketService',
		function(marketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/ticks.template.html',
			link: function(scope, element) {
				scope.ticks = [5, 6, 7, 8, 9, 10];
				scope.$parent.selected.tick = marketService.getDefault.tick();

				scope.updateTick = function(_tick) {
					scope.$parent.selected.tick = _tick;
				};
			}
		};
	}]);
