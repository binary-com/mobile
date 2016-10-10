/**
 * @name purchase controller
 * @author morteza tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright binary ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.components.purchase.controllers')
        .controller('PurchaseController', Purchase);

    Purchase.$inject = [
        '$scope', 'analyticsService',
        'accountService', 'proposalService',
        'tradeService', 'websocketService',
    ];

    function Purchase($scope, analyticsService,
            accountService, proposalService,
            tradeService, websocketService){
        var vm = this;

        vm.contracts = [];
        vm.proposalResponses = [];
        vm.inPurchaseMode = false;
        vm.showSummary = false;
        vm.purchasedContractIndex = -1;

        $scope.$watch(()=>{ return vm.proposal }, (newValue, oldValue) =>{
          proposalUpdated();
        }, true);

        $scope.$on('proposal', (e, proposal, reqId) => {
            if([1, 2].indexOf(reqId) > -1){
                $scope.$applyAsync(() => {
                    vm.proposalResponses[reqId-1] = proposal;
                    vm.proposalResponses[reqId-1].hasError = false;
                });
            }

        });

        $scope.$on('proposal:error', (e, error, reqId) => {

            if([1, 2].indexOf(reqId) > -1){
                $scope.$applyAsync(() => {
                  vm.proposalResponses[reqId-1] = error;
                  vm.proposalResponses[reqId-1].hasError = true;
                });
            }
        });

        $scope.$on('purchase', (e, response) => {
          if(!_.isEmpty(response.buy)){
            vm.showSummary = true;
            $scope.$applyAsync(() => {
              vm.purchasedContract = {
                contractId: response.buy.contract_id,
                longcode: response.buy.longcode,
                payout: vm.proposalResponses[vm.purchasedContractIndex].payout,
                cost: response.buy.buy_price,
                profit: parseFloat(vm.proposalResponses[vm.purchasedContractIndex].payout) - parseFloat(response.buy.buy_price),
                balance: response.buy.balance_after,
                transactionId: response.buy.transaction_id
              };
            });
            websocketService.sendRequestFor.portfolio();

          }
        });

        $scope.$on('purchase:error', (e, error) => {
            vm.inPurchaseMode = false;
            vm.showSummary = false;
            vm.purchasedContractIndex = -1;
            sendProposal();
        });

        $scope.$on('contract:finished', (e, contract) => {

          if(contract.exitSpot){
            if(contract.result === "win"){
              vm.purchasedContract.buyPrice = vm.purchasedContract.cost;
              vm.purchasedContract.profit = vm.purchasedContract.profit;
              vm.purchasedContract.finalPrice = vm.purchasedContract.buyPrice + vm.purchasedContract.profit;
              websocketService.sendRequestFor.openContract();
            }
            else if(contract.result === "lose"){
              vm.purchasedContract.buyPrice = vm.purchasedContract.cost;
              vm.purchasedContract.loss = vm.purchasedContract.cost;
              vm.purchasedContract.finalPrice = vm.purchasedContract.buyPrice + vm.purchasedContract.loss;
            }
            vm.purchasedContract.result = (contract.result === 'lose' ? 'loss' : contract.result);


            var proposal = vm.contracts[vm.purchasedContractIndex];

            // Send statistic to Google Analytics
            analyticsService.google.trackEvent(
                vm.user.id,
                proposal.underlying_symbol,
                proposal.contract_type,
                vm.purchasedContract.payout);


            var ampEventProperties = {
              Symbol: proposal.underlying_symbol,
              TradeType: proposal.contract_type,
              Stake: vm.purchasedContract.buyPrice,
              Market: proposal.market,
              Duration: vm.proposal.duration,
              DurationUnit: vm.proposal.duration_unit,
              result: contract.result === "lose" ? "Lost": "Won"
            }
            // Send statistic to Amplitude
            analyticsService.amplitude.logEvent("Purchase", ampEventProperties);

            sendProposal();

            // Unlock view to navigate
            vm.inPurchaseMode = false;
          }
        });

        vm.getImageUrl = function(contractType){
            return "img/trade-icon/" + contractType.toLowerCase() + ".svg";
        }

        vm.purchase = function(contractIndex){
            $scope.$applyAsync(() => {
                vm.purchasedContractIndex = contractIndex;
                vm.inPurchaseMode = true;
            });
            proposalService.purchase(vm.proposalResponses[contractIndex]);
        }

        vm.backToTrade = function(){
          vm.showSummary = false;
          vm.purchasedContractIndex = -1;
        }

        function init(){
          vm.user = accountService.getDefault();
          if(_.isEmpty(vm.contracts)){
            setTimeout(init, 500);
            return;
          }
          sendProposal();
        }

        function sendProposal(){

            proposalService.forget();

            var proposal1 = _.clone(vm.proposal);
            proposal1.contract_type = vm.contracts[0].contract_type;
            proposal1.req_id = 1;

            var proposal2 = _.clone(vm.proposal);
            proposal2.contract_type = vm.contracts[1].contract_type;
            proposal2.req_id = 2;

            proposalService.send(proposal1);
            proposalService.send(proposal2);
        }

        function proposalUpdated(){
            if(!_.isEmpty(sessionStorage.tradeTypes)){
                var tradeTypes = JSON.parse(sessionStorage.tradeTypes);
                vm.contracts = tradeTypes[vm.proposal.tradeType];

                if(!_.isEmpty(vm.contracts)){
                    sendProposal();
                }
            }
            else {
              setTimeout(proposalUpdated, 5);
            }
        }

        init();

    }
})();
