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
		function(websocketService, alertService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/purchase.template.html',
			link: function(scope, element) {
				scope.purchase = function() {
					$('.contract-purchase button').attr('disabled', true);
					websocketService.sendRequestFor.purchase(scope.$parent.proposalRecieved.id, scope.$parent.proposalRecieved.ask_price);
				};

				scope.$on('purchase', function(e, _contractConfirmation) {
					if (_contractConfirmation) {
						scope.tradeMode = false;
						scope.contract = {
							longcode: _contractConfirmation.longcode,
							payout: scope.$parent.proposalRecieved.payout,
							cost: _contractConfirmation.buy_price,
							profit: parseFloat(scope.$parent.proposalRecieved.payout) - parseFloat(_contractConfirmation.buy_price),
							balance: _contractConfirmation.balance_after
						};
						scope.$apply();
					} else {
						alertService.contractError.notAvailable();
						$('.contract-purchase button').attr('disabled', false);
					}
				});
			}
		};
	}]);
