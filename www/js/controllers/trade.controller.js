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
		function($scope, $state, proposalService, 
                websocketService, accountService, 
                alertService, appStateService, analyticsService) {

            appStateService.waitForProposal = false;
            $scope.currency = _.isEmpty(accountService.getDefault().currency) ? sessionStorage.currency : accountService.getDefault().currency;

			window.addEventListener('native.keyboardhide', function(e) {
				$scope.$applyAsync(function(){
                    $scope.hideFooter = false;
                });
				
			});

			window.addEventListener('native.keyboardshow', function(e) {
                $scope.$applyAsync(function(){
				    $scope.hideFooter = true;
                });
			});

            $scope.setTradeMode = function(mode){
                appStateService.tradeMode = mode;
            }

            $scope.getTradeMode = function(){
                return appStateService.tradeMode;
            }

			var init = function () {

                analyticsService.google.trackView("Trade");



				$scope.proposalToSend = JSON.parse(localStorage.proposal);
				$scope.setTradeMode(true);
                appStateService.purchaseMode = false;
			};

			init();
			websocketService.sendRequestFor.forgetAll('balance');
			websocketService.sendRequestFor.balance();

			$scope.$on('proposal', function(e, response) {
                $scope.$applyAsync(function(){
                    $scope.proposalRecieved = response;
                    appStateService.waitForProposal = false;
                });
			});
	
			$scope.$on('balance', function(e, _balance) {
                $scope.$applyAsync(function(){
    				$scope.account = _balance;
                });
			});

			$scope.$on('purchase', function(e, _contractConfirmation) {
				if (_contractConfirmation.buy) {
                    $scope.$applyAsync(function(){
                        $scope.setTradeMode(false);
                        appStateService.purchaseMode = true;
                        $scope.contract = {
                            contract_id: _contractConfirmation.buy.contract_id,
                            longcode: _contractConfirmation.buy.longcode,
                            payout: $scope.proposalRecieved.payout,
                            cost: _contractConfirmation.buy.buy_price,
                            profit: parseFloat($scope.proposalRecieved.payout) - parseFloat(_contractConfirmation.buy.buy_price),
                            balance: _contractConfirmation.buy.balance_after,
                            transaction_id: _contractConfirmation.buy.transaction_id
                        };
                        websocketService.sendRequestFor.portfolio();
                    });
				} else if (_contractConfirmation.error){
					alertService.displayError(_contractConfirmation.error.message);
					$('.contract-purchase button').attr('disabled', false);
					
					proposalService.send();
				} else {
					alertService.contractError.notAvailable();
					$('.contract-purchase button').attr('disabled', false);
				}
				websocketService.sendRequestFor.balance();

			});

            $scope.$on('purchase:error', function(e, _error){
                $('.contract-purchase button').attr('disabled', false);
                appStateService.purchaseMode = false;
                proposalService.send();
            });

			$scope.$on('contract:finished', function (e, _contract){
				if(_contract.exitSpot){
                    $scope.$applyAsync(function(){
                        if(_contract.result === "win"){
                            $scope.contract.buyPrice = $scope.contract.cost;
                            $scope.contract.profit = $scope.contract.profit;
                            $scope.contract.finalPrice = $scope.contract.buyPrice + $scope.contract.profit;
                            websocketService.sendRequestFor.openContract();
                        }
                        else if(_contract.result === "lose"){
                            $scope.contract.buyPrice = $scope.contract.cost;
                            $scope.contract.loss = $scope.contract.cost * -1;
                            $scope.contract.finalPrice = $scope.contract.buyPrice + $scope.contract.loss;
                        }
                        $scope.contract.result = _contract.result;
                        
                        // Unlock view to navigate
                        appStateService.purchaseMode = false;

                        var proposal = JSON.parse(localStorage.proposal);
                        
                        // Send statistic to Google Analytics
                        analyticsService.google.trackEvent(
                            $scope.account.loginid,
                            proposal.symbol,
                            proposal.contract_type,
                            $scope.proposalRecieved.payout);
                        
                        var ampEventProperties = {
                                Symbol: proposal.symbol,
                                TradeType: proposal.contract_type,
                                Stake: proposal.basis === "payout" ? $scope.proposalRecieved.ask_price : proposal.ammount,
                                Market: proposal.passthrough.market,
                                Duration: proposal.duration,
                                DurationUnit: proposal.duration_unit,
                                result: _contract.result === "lose" ? "Lost": "Won"
                        }
                        // Send statistic to Amplitude
                        analyticsService.amplitude.logEvent("Purchase", ampEventProperties);
                        
                        proposalService.send();

                    });
				}
			});

            $scope.$on('proposal:open-contract', function(e, contract){
                if(contract.is_expired){
                    websocketService.sendRequestFor.sellExpiredContract();
                }
            });

			$scope.navigateToOptionsPage = function($event) {
				$state.go('options');
			};

			$scope.$on('connection:ready', function(e) {
				if (accountService.hasDefault()) {
					accountService.validate();

					$scope.proposalToSend = JSON.parse(localStorage.proposal);

					proposalService.send();

                    if(appStateService.purchaseMode){

                        sendProfitTableRequest();
                    }
				}
			});

            $scope.$on('profit_table:update', function(e, _profitTable, _passthrough){

                if(_passthrough.hasOwnProperty('isConnectionReopen')
                        && _passthrough.isConnectionReopen){
                    
                    if(_profitTable.count > 0){
                        // Check that contract is finished or not after connection reopenning
                        if(appStateService.purchaseMode){
                            // find the current contract in the portfolio-table list
                            var transaction = _.find(_profitTable.transactions, ['transaction_id', $scope.contract.transaction_id]);
                            if(transaction){
                                var finishedContract ={};
                                finishedContract.exitSpot = true;
                                finishedContract.result = transaction.sell_price > 0 ? "win" : "lose";
                                $scope.$broadcast('contract:finished', finishedContract);
                            }
                        }
                    }
                    else{
                        // because there is not any items in profitTable, the user is navigating to trade mode view
                        appStateService.purchaseMode = false;
                        appStateService.tradeMode = true;
                    }
                }
            });

            $scope.isContractFinished = function(){
                return !appStateService.purchaseMode;
            };

            $scope.getWaitForProposal = function(){
                return appStateService.waitForProposal;
            }
           
            function sendProfitTableRequest(params){
                // Wait untile the login progress is finished
                if(!appStateService.isLoggedin){
                    setTimeout(sendProfitTableRequest, 500);
                }
                else{
                    var conditions = {};
                    // Format date to 'YYYY-MM-DD'
                    conditions.date_from =  new Date().toISOString().slice(0, 10);
                    conditions.date_to = conditions.date_from;
                    conditions.limit = 10;
                    conditions.passthrough = { isConnectionReopen: true };
                    
                    websocketService.sendRequestFor.profitTable(conditions);
                }
            }

            $scope.hasTradePermission = function(){
                return accountService.checkScope(['READ', 'TRADE']);
            }
	});
