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
				
					var proposal = JSON.parse(localStorage.proposal);
                    
					// Send statistic to Google Analytics
					if(typeof(analytics) !== 'undefined'){
						analytics.trackEvent(
							scope.$parent.account.loginid,
							proposal.symbol,
							proposal.contract_type,
							scope.$parent.proposalRecieved.payout
						);
					}
                    else{
                        // Send statistic to Amplitude
                        amplitude.logEvent("user id: " + scope.$parent.account.loginid + "\r\n" +
                                "Symbol: " + proposal.symbol + "\r\n" +
                                "TradeType: " + proposal.contract_type + "\r\n" +
                                "Payout: " + scope.$parent.proposalRecieved.payout + "\r\n" +
                                "AskPrice: " + scope.$parent.proposalRecieved.ask_price
                                );
                    }
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
