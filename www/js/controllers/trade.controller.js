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
		function($scope, $state, $ionicSlideBoxDelegate, marketService, proposalService, websocketService, accountService, alertService) {
			var init = function () {

				if(typeof(analytics) !== "undefined"){
					analytics.trackView("Trade");
				}

				$scope.proposalToSend = JSON.parse(localStorage.proposal);
				$scope.tradeMode = true;
				$scope.contractFinished = false;
				proposalService.send();
			};

			init();

			$scope.$on('proposal', function(e, response) {
				$scope.proposalRecieved = response;
				$scope.proposalRecieved.currency = accountService.getDefault().currency;
				$scope.$apply();
			});

			websocketService.sendRequestFor.balance();
			$scope.$on('balance', function(e, _balance) {
				if(_balance === undefined){
					websocketService.sendRequestFor.balance();
				}
				$scope.account = _balance;
				$scope.$apply();
			});

			$scope.$on('purchase', function(e, _contractConfirmation) {
				if (_contractConfirmation.buy) {
					$scope.tradeMode = false;
					$scope.contractFinished = false;
					$scope.contract = {
						contract_id: _contractConfirmation.buy.contract_id,
						longcode: _contractConfirmation.buy.longcode,
						payout: $scope.proposalRecieved.payout,
						cost: _contractConfirmation.buy.buy_price,
						profit: parseFloat($scope.proposalRecieved.payout) - parseFloat(_contractConfirmation.buy.buy_price),
						balance: _contractConfirmation.buy.balance_after
					};
					websocketService.sendRequestFor.portfolio();
					$scope.$apply();
				} else if (_contractConfirmation.error){
					alertService.displayError(_contractConfirmation.error.message);
					$('.contract-purchase button').attr('disabled', false);
				} else {
					alertService.contractError.notAvailable();
					$('.contract-purchase button').attr('disabled', false);
				}
				websocketService.sendRequestFor.balance();

				// it's moved to first if
				// websocketService.sendRequestFor.portfolio();
			});

			$scope.$on('contract:finished', function (e, _contract){
				if(_contract.exitSpot){
					$scope.contractFinished = true;
					if(_contract.result === "win"){
						$scope.contract.buyPrice = $scope.contract.cost;
						$scope.contract.profit = $scope.contract.profit;
						$scope.contract.finalPrice = $scope.contract.buyPrice + $scope.contract.profit;
					}
					else if(_contract.result === "lose"){
						$scope.contract.buyPrice = $scope.contract.cost;
						$scope.contract.loss = $scope.contract.cost * -1;
						$scope.contract.finalPrice = $scope.contract.buyPrice + $scope.contract.loss;
					}
					$scope.contract.result = _contract.result;

					if(!$scope.$$phase){
						$scope.$apply();
					}
				}
			});

			$scope.navigateToOptionsPage = function($event) {
				$state.go('options');
			};

			$scope.backToOptionPage = function() {
				$('.contract-purchase button').attr('disabled', false);
				proposalService.send();
				$scope.tradeMode = true;
				websocketService.sendRequestFor.balance();
			};

			$scope.$on('connection:reopened', function(e) {
				if (accountService.hasDefault()) {
					accountService.validate();

					websocketService.sendRequestFor.symbols();
					websocketService.sendRequestFor.assetIndex();

					$scope.proposalToSend = JSON.parse(localStorage.proposal);
					$scope.tradeMode = true;

					proposalService.send();
				}
			});
	});
