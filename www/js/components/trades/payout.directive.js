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
		'marketService',
		'proposalService',
		'delayService',
        'appStateService',
		function(marketService, proposalService, delayService, appStateService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/trades/payout.template.html',
			link: function(scope, element) {

				var minimumUpdateDelay = 1000;
				scope.basis = scope.$parent.proposalToSend.basis || 'payout';
				scope.amount = marketService.getDefault.amount();

                if(scope.amount == 0){
                    scope.amount = 5;
                    updateProposal();
                }
                scope.proposalError = null;

                proposalService.send();

                scope.$on('$destroy', function(){
                    delayService.remove('updateProposal');
                });

				scope.$parent.$watch('proposalRecieved', function(_proposal){
					if (_proposal) {
                        scope.$applyAsync(function(){
                            var netProfit = parseFloat(_proposal.payout) - parseFloat(_proposal.ask_price);
                            _proposal.netProfit =  (isNaN(netProfit) || netProfit < 0) ? '0' : netProfit.toFixed(2);
                            scope.proposal = _proposal;
                            scope.proposalError = null;

                            if(scope.$parent && scope.$parent.purchaseFrom){
                                scope.$parent.purchaseFrom.amount.$setValidity("InvalidAmount", true);
                            }
                        });
					}
				});

                scope.$on('proposal:error', function(e, error){

                    scope.$applyAsync(function(){
                        scope.proposalError = error;

                        if(scope.$parent.purchaseFrom){
                            scope.$parent.purchaseFrom.amount.$setValidity("InvalidAmount", false);
                        }
                    });
                    
                });

				function roundNumber(_newAmount, _oldAmount) {
					var parsed = parseFloat(_newAmount, 10);
					if (parsed !== parsed) {
						return _oldAmount;
					}
					return Math.round(parsed * 100) / 100;
				};

				function updateProposal() {
					var proposal = proposalService.get();
					if (proposal) {
						proposal.amount = parseFloat(scope.amount, 10);
						proposalService.update(proposal);
						proposalService.send(scope.proposal && scope.proposal.id ? scope.proposal.id : null);

					}
				};

				scope.delayedUpdateProposal = function delayedUpdateProposal() {
                    scope.$applyAsync(function(){
                        appStateService.waitForProposal = true;
                    });

					delayService.update('updateProposal', updateProposal, minimumUpdateDelay);
				};

				scope.updateAmount = function(_form) {
					scope.delayedUpdateProposal();
				};
				

				scope.addAmount = function() {
					var amount = parseFloat(scope.amount);
                    
                    if(isNaN(amount)){
                        amount = 0;
                    }

					scope.amount = (amount < 100000) ? Number(amount + 1).toFixed(2) : 100000;
				};

				scope.subtractAmount = function() {
					var amount = parseFloat(scope.amount);
					scope.amount = (amount > 2) ? Number(amount - 1).toFixed(2) : 1;
				};

				scope.isObjectEmpty = function(_obj) {
					return _.isEmpty(_obj);
				}
			}
		};
	}]);
