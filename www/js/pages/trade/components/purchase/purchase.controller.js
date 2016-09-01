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
        '$scope', 'proposalService',
        'tradeService', 'websocketService'
    ];

    function Purchase($scope, proposalService,
            tradeService, websocketService){
        var vm = this;

        vm.contracts = [];
        vm.proposalResponses = [];
        vm.inPurchaseMode = false;
        vm.purchasedContractIndex = -1;

        $scope.$watch(()=>{ return vm.proposal }, (newValue, oldValue) =>{
          /*
            if(!tradeService.proposalIsReady || newValue === oldValue){
                return;
            }
          */
            if(!_.isEmpty(sessionStorage.tradeTypes)){
                var tradeTypes = JSON.parse(sessionStorage.tradeTypes);
                vm.contracts = tradeTypes[vm.proposal.tradeType];

                if(!_.isEmpty(vm.contracts)){
                    sendProposal();
                }
            }

        }, true);

        $scope.$on('proposal', (e, proposal, reqId) => {
            if([1, 2].indexOf(reqId) > -1){
                $scope.$applyAsync(() => {
                    vm.proposalResponses[reqId-1] = proposal;
                });
            }

        });

        $scope.$on('purchase', (e, response) => {
            if(!_.isEmpty(response.buy)){
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
            vm.purchasedContractIndex = -1;
            sendProposal();
        });

        $scope.$on('contract:finished', (e, contract) => {

            sendProposal();
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

        function init(){
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

        init();

    }
})();
