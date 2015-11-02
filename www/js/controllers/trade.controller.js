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
				$scope.amount = tradeService.getAmount();
				$scope.basis = tradeService.getBasis();
			}

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
				if ($scope.amount > 2) {
					$scope.amount -= 1;
					tradeService.setAmount($scope.amount);
					tradeService.sendProposal();
				}
			};

			$scope.addAmount = function() {
				// TODO: limit to the account balance for stake
				// TODO: figure out how to handle it for payout
				if ($scope.amount < 100000) {
					$scope.amount += 1;
					tradeService.setAmount($scope.amount);
					tradeService.sendProposal();
				}
			};

			$scope.updateBasis = function(_basis) {
				console.log('basis updated: ', _basis);
			};

			$scope.buy = function() {
				console.log('buying a contract');
			};

			$scope.navigateToOptionsPage = function($event) {
				$state.go('options');
			};
	});
