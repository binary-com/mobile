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
		function(websocketService, alertService, $rootScope) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/purchase.template.html',
			link: function(scope, element) {
				scope.purchase = function() {
					$('.contract-purchase button').attr('disabled', true);
					websocketService.sendRequestFor.purchase(scope.$parent.proposalRecieved.id, scope.$parent.proposalRecieved.ask_price);
					
					// Send statistic to Google Analytics
					if(typeof(analytics) !== "undefined"){
						var proposal = JSON.parse(localStorage.proposal);
						analytics.trackEvent(
							scope.$parent.account.loginid,
							proposal.symbol,
							proposal.contract_type,
							scope.$parent.proposalRecieved.payout
						);
					}
				};
			}
		};
	}]);
