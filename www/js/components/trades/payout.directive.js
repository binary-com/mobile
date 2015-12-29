/**
 * @name payout
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('payout',[
		'websocketService',
		'marketService',
		'proposalService',
		function(websocketService, marketService, proposalService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/payout.template.html',
			link: function(scope, element) {

				scope.basis = scope.$parent.proposalToSend.basis || 'payout';
				scope.amount = marketService.getDefault.amount() || 5;

				scope.$parent.$watch('proposalRecieved', function(_proposal){
					if (_proposal) {
						var netProfit = parseFloat(_proposal.payout) - parseFloat(_proposal.ask_price);
						_proposal.netProfit =  (isNaN(netProfit) || netProfit < 0) ? '0' : netProfit.toFixed(2);
						scope.proposal = _proposal;
					}
				});

				var roundNumber = function(_newAmount, _oldAmount) {
					var parsed = parseFloat(_newAmount, 10);
					if (parsed !== parsed) {
						return _oldAmount;
					}
					return Math.round(parsed * 100) / 100;
				};

				var updateProposal = function() {
					var proposal = proposalService.get();
					if (proposal) {
						proposal.amount = scope.amount;
						proposalService.update(proposal);
						proposalService.send(scope.proposal.id);
					}
				};

				scope.updateAmount = function(_newAmount, _oldAmount) {
					// scope.amount = parseFloat(parseFloat(_newAmount).toFixed(2));//roundNumber(_newAmount, _oldAmount);
					updateProposal();
				};

				// TODO: limit to the account balance for stake
				// TODO: figure out how to handle it for payout
				scope.addAmount = function() {
					var amount = parseFloat(scope.amount);
					scope.amount = (amount < 100000) ? amount + 1 : 100000;
					updateProposal();
				};

				scope.subtractAmount = function() {
					var amount = parseFloat(scope.amount);
					scope.amount = (amount > 2) ? amount - 1 : 1;
					updateProposal();
				};
			}
		};
	}]);
