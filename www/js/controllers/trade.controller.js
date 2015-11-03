/**
 * @name TradeController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles trade's functionalities
 */

angular
	.module('binary')
	.controller('TradeController',
		function($scope, $state, tradeService, websocketService) {
			$scope.proposal = {};

			// get balance of the current account

			// send the current proposal
			tradeService.sendProposal();
			// send the tick request


			var init = function() {
				$scope.tradeMode = true;

				$scope.amount = tradeService.getAmount();
				$scope.basis = tradeService.getBasis();
			};

			init();

			$scope.$on('proposal', function(e, response) {
				init();
				$scope.proposal = response;

				$scope.$apply();
			});

			$scope.$on('ticks', function(e, response) {
				console.log('x ticks');
			});

			$scope.subtractAmount = function() {
				$scope.amount = parseInt($scope.amount);
				if ($scope.amount > 2) {
					$scope.amount -= 1;
					tradeService.setAmount($scope.amount);
					tradeService.sendProposal();
				}
			};

			$scope.addAmount = function() {
				// TODO: limit to the account balance for stake
				// TODO: figure out how to handle it for payout
				$scope.amount = parseInt($scope.amount);
				if ($scope.amount < 100000) {
					$scope.amount += 1;
					tradeService.setAmount($scope.amount);
					tradeService.sendProposal();
				}
			};

			$scope.updateBasis = function(_basis) {
				console.log('basis updated: ', _basis);
			};

			$scope.purchase = function() {
				console.log('buying a contract');
				// disable the button
				$('.contract-purchase button').attr('disabled', true);
				// make the purchase
				console.log('proposal: ', $scope.proposal.id);
				console.log('proposal: ', $scope.proposal.ask_price);
				websocketService.sendRequestFor.purchase($scope.proposal.id, $scope.proposal.ask_price);
			};

			$scope.$on('purchase', function(e, response) {
				$scope.tradeMode = false;

				$scope.contract = {
					longcode: response.longcode,
					payout: $scope.proposal.payout,
					cost: response.buy_price,
					profit: parseFloat($scope.proposal.payout) - parseFloat(response.buy_price),
					balance: response.balance_after
				};

				$scope.$apply();
			});

			$scope.navigateToOptionsPage = function($event) {
				$state.go('options');
			};

			$scope.backToTrade = function() {
				$('.contract-purchase button').attr('disabled', false);
				$scope.tradeMode = true;
			};
	});
