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
		function($scope, $rootScope, $state, $window, config, proposalService,
            accountService, websocketService, chartService, delayService,
            appStateService) {

			$scope.selected = {};
			$scope.isDataLoaded = false;
            $scope.letsTrade = false;

			if(typeof(analytics) !== "undefined"){
					analytics.trackView("Options");
			}

			websocketService.sendRequestFor.forgetAll('ticks');

            function updateSymbols(){
                if(!appStateService.isLoggedin){
                    setTimeout(updateSymbols, 500);
                }
                else{
                    websocketService.sendRequestFor.symbols();
                    websocketService.sendRequestFor.assetIndex();
                }
            }

			delayService.update('symbolsAndAssetIndexUpdate', function(){
                updateSymbols();
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

                    // set selected category
                    var tradeType = _.find(config.tradeTypes, ['value', proposal.contract_type]);
                    if(tradeType){
                        $scope.selected.tradeCategory = tradeType.category;
                    }

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

				proposalService.update(proposal);
			};

			$scope.$on('connection:reopened', function(e) {
//				if (accountService.hasDefault()) {
//					accountService.validate();
//				}

			});

			$scope.$watch('selected', function(_newValue, _oldValue){
				if(!angular.equals(_newValue, _oldValue)){
					$scope.saveChanges();
				}
			}, true);

            $scope.setDataLoaded = function(stopSpinner, enableLetsTrade){
                $scope.isDataLoaded = stopSpinner;
                $scope.letsTrade = _.isNil(enableLetsTrade) ? stopSpinner : enableLetsTrade;
            };
	});
