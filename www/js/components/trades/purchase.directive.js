/**
 * @name purchase
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('purchase',[
		'websocketService',
        'appStateService',
		function(websocketService, appStateService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/purchase.template.html',
			link: function(scope, element, attrs) {
                scope.attrs = attrs;
                scope.title = attrs.title ? attrs.title : 'trade.buy';

				scope.purchase = function() {
					$('.contract-purchase button').attr('disabled', true);
                    appStateService.purchaseMode = true;
					websocketService.sendRequestFor.purchase(scope.$parent.proposalRecieved.id, scope.$parent.proposalRecieved.ask_price);
				
				};

                scope.getNgDisabled = function(){
                    if(scope.attrs['ngDisabled']){
                        return scope.$eval(scope.attrs['ngDisabled']);
                    }
                    return false;
                };
			}
		};
	}]);
