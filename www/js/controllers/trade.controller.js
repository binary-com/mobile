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
		function($scope, $state, messageService, websocketService) {
			// set the default amount
			$scope.amount = 5;

			$scope.account = {
				currency: messageService.getAccountInfo('currency'),
				balance: messageService.getAccountInfo('balance')
			};

			var proposalId = '';

			//websocketService.send.proposal();
			websocketService.get.tradingTimes();

			$scope.displayOptions = function($event) {

				$state.go('options');
			};

			$scope.purchase = function() {
				websocketService.send.buy(proposalId, 100);
			};

			$scope.$on('proposal', function(e, response) {
				proposalId = response.id;
				if (response) {
					$scope.longcode = response.longcode;
					// TODO: update condition for stake
					// $scope.price = (true) ? response.ask_price : response.payout;
					$scope.price = response.ask_price;
					$scope.$apply();
				}
			});

			$scope.$on('buy', function(e, response) {
				if (response) {
					messageService.updateContract(response);
					$state.go('contract');
				}
			});

			$scope.logout = function() {
				//websocketService.close();
				$state.go('signin');
			};

			$scope.subtractAmount = function() {
				// TODO: handle negative values
				if ($scope.amount !== 1) {
					$scope.amount -= 1;
					messageService.updateProposal.amount($scope.amount);
					websocketService.send.forget(proposalId);
					websocketService.send.proposal();
				}
			};

			$scope.addAmount = function() {
				console.log('adding amount');
				// TODO: limit to the account balance for stake
				// TODO: figure out how to handle it for payout
				if ($scope.amount !== 100000) {
					$scope.amount += 1;
					messageService.updateProposal.amount($scope.amount);
					websocketService.send.forget(proposalId);
					websocketService.send.proposal();
				}
			};

	});
