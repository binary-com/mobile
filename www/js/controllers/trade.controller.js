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
		function($scope, $state, tradeService, websocketService, accountService) {
			$scope.proposal = {};

			// send the current proposal
			tradeService.sendProposal();
      var chartGenerator = function chartGenerator(){
        var maxEntries = 20;
        // Generate empty chart to begin with
        var chart = c3.generate({
          bindto: '#chart',
          transition: {
            duration: 0
          },
          data: {
            x: 'epoch',
            columns: [
              ['epoch'],
              ['quote']
            ]
          }
        });
        // add the feed data in this feed_list
        var feed_list = {
          quote: [],
          epoch: []
        };
        var removeExtraEntries = function removeExtraEntries(){
          if (feed_list.quote.length > maxEntries){
            feed_list.quote.shift();
            feed_list.epoch.shift();
          }
        }
        return {
          addTick : function addTick(tick){
            feed_list.quote.push(tick.quote);
            feed_list.epoch.push(tick.epoch);
            removeExtraEntries();
            // x = epoch, y = quote
            chart.load({
              columns: [
                ['epoch'].concat(feed_list.epoch),
                ['quote'].concat(feed_list.quote)
              ]
            });
            }

        };
      };
      $scope.chartGenerator = chartGenerator();
			var tick = '';

			var init = function() {
				$scope.tradeMode = true;

				$scope.amount = tradeService.getAmount();
				$scope.basis = tradeService.getBasis();

				websocketService.sendRequestFor.balance();

				var newTick = JSON.parse(localStorage.proposal).symbol;
				if (!tick || tick !== newTick) {
					tick = newTick;
					websocketService.sendRequestFor.forgetTicks();
					websocketService.sendRequestFor.ticksForSymbol(newTick);
				}
			};

			init();

			$scope.$on('proposal', function(e, response) {
				init();
				$scope.proposal = response;
				$scope.$apply();
			});

			$scope.$on('balance', function(e, response) {
				$scope.account = response;
				$scope.$apply();
			});

			$scope.$on('tick', function(e, response) {
				$scope.tick = response.quote;
        $scope.chartGenerator.addTick(response);
				$scope.$apply();
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
