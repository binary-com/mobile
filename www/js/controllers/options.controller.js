/**
 * @name OptionsController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles changing contract's options
 */

angular
	.module('binary')
	.controller('OptionsController',
		function($scope, $rootScope, $state, $window, config, proposalService, accountService, websocketService, chartService, delayService) {
			$scope.selected = {};
			$scope.isDataLoaded = false;

			if(typeof(analytics) !== "undefined"){
					analytics.trackView("Options");
			}

			delayService.update('symbolsAndAssetIndexUpdate', function(){
				websocketService.sendRequestFor.symbols();
				websocketService.sendRequestFor.assetIndex();
			}, 60*1000);

			function init(){
				var proposal = proposalService.get();
				if(proposal){
					$scope.selected = {
						symbol: proposal.symbol,
						tradeType: proposal.contract_type,
						tick: proposal.duration,
						basis: proposal.basis,
						market: proposal.passthrough.market,
						digit: proposal.digit
					};

					if(proposal.barrier){
						$scope.selected.barrier = proposal.barrier;
					}
				}
			}

			init();

			$scope.navigateToManageAccounts = function() {
				$state.go('accounts');
			};

			$scope.navigateToTradePage = function() {
				$state.go('trade');
			};

			$scope.saveChanges = function() {
				var proposal = {
					symbol: $scope.selected.symbol,
					contract_type: $scope.selected.tradeType,
					duration: $scope.selected.tick,
					basis: $scope.selected.basis,
					currency: accountService.getDefault().currency,
					passthrough: {
						market: $scope.selected.market
					},
					digit: $scope.selected.digit,
					barrier: $scope.selected.barrier
				};

				if(proposal.contract_type === "DIGITDIFF" || proposal.contract_type === "DIGITMATCH" ||
					proposal.contract_type === "DIGITOVER" || proposal.contract_type === "DIGITUNDER"){
					if((proposal.digit == 0 || !proposal.digit) && proposal.contract_type === "DIGITUNDER"){
						proposal.barrier = 1;
					}
					else if(proposal.digit == 9 && proposal.contract_type === "DIGITOVER"){
						proposal.barrier = 8;
					}
					else{
						proposal.barrier = proposal.digit;
					}
				}

				proposalService.update(proposal);
				proposalService.send();

				//$state.go('trade', {}, { reload: true, inherit: false, notify: true });
			};

			$scope.$on('connection:reopened', function(e) {
				if (accountService.hasDefault()) {
					accountService.validate();
				}

				// below line commented to solve connection lost error.
				// $window.location.reload();
			});

			$scope.$watch('selected', function(_newValue, _oldValue){
				if(!angular.equals(_newValue, _oldValue)){
					$scope.saveChanges();
				}
			}, true);
	});

























