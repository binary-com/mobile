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
		function($scope, $state, $ionicSlideBoxDelegate, marketService, proposalService, websocketService, accountService) {

			var init = function () {
				$scope.proposalToSend = JSON.parse(localStorage.proposal);
				$scope.tradeMode = true;
				proposalService.send();
				$scope.slideBoxDelicate = $ionicSlideBoxDelegate;
			};

			init();

			$scope.$on('proposal', function(e, response) {
				$scope.proposalRecieved = response;
				$scope.$apply();
			});

			websocketService.sendRequestFor.balance();
			$scope.$on('balance', function(e, _balance) {
				$scope.account = _balance;
				$scope.$apply();
			});

			$scope.$on('purchase', function(e, _contractConfirmation) {
				if (_contractConfirmation) {
					$scope.tradeMode = false;
					$scope.contract = {
						longcode: _contractConfirmation.longcode,
						payout: $scope.proposalRecieved.payout,
						cost: _contractConfirmation.buy_price,
						profit: parseFloat($scope.proposalRecieved.payout) - parseFloat(_contractConfirmation.buy_price),
						balance: _contractConfirmation.balance_after
					};
					$scope.$apply();
				} else {
					alertService.contractError.notAvailable();
					$('.contract-purchase button').attr('disabled', false);
				}
			});

			$scope.navigateToOptionsPage = function($event) {
				$state.go('options');
			};

			$scope.backToOptionPage = function() {
				$('.contract-purchase button').attr('disabled', false);
				$scope.tradeMode = true;
				$state.go('options');
			};
	});
