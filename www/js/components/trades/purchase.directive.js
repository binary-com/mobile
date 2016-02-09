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
		'alertService',
		'$rootScope',
        'appStateService',
		function(websocketService, alertService, $rootScope, appStateService) {
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
					
					// Send statistic to Google Analytics
					if(typeof(analytics) !== 'undefined'){
						var proposal = JSON.parse(localStorage.proposal);
						analytics.trackEvent(
							scope.$parent.account.loginid,
							proposal.symbol,
							proposal.contract_type,
							scope.$parent.proposalRecieved.payout
						);
					}
				};

                scope.getNgDisabled = function(){
                    if(scope.attrs['ngDisabled']){
                        if(scope.attrs['ngDisabled'][0] != '!'){
                            return eval('scope.' + scope.attrs['ngDisabled']);
                        }
                        else{
                            return eval('!scope.' + scope.attrs['ngDisabled'].slice(1, scope.attrs['ngDisabled'].length));
                        }
                    }
                    return false;
                };
			}
		};
	}]);
