/**
 * @name longCode
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('longCode',[
		'websocketService',
		function(websocketService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/longcode.template.html',
			link: function(scope, element) {
				scope.$parent.$watch('proposalRecieved', function(_proposal){
					scope.longcode = _proposal ? _proposal.longcode : '';
				});
			}
		};
	}]);
