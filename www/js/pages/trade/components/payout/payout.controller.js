/**
 * @name payout controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.components.payout.controllers')
        .controller('PayoutController', Payout);

    Payout.$inject = ['proposalService'];

    function Payout(proposalService){
        var vm = this;
        vm.amount = vm.proposal.amount;


        vm.changePayoutType = function(){
            if(vm.proposal.basis === "payout"){
                vm.proposal.basis = "stake";
            } else {
                vm.proposal.basis = "payout";
            }
            proposalService.setPropertyValue('basis', vm.proposal.basis);
        }

        vm.changeAmount = function(){
          if(_.isEmpty(vm.amount) || vm.amount === 'NaN' || Number(vm.amount) == 0){
            vm.proposal.amount = 0;
          } else {
            vm.proposal.amount = vm.amount;
          }
          proposalService.setPropertyValue('amount', vm.proposal.amount);
        }

        vm.add = function(){
           vm.amount = (Number(vm.amount) + 1) <= 10000 ? Number(vm.amount) + 1 : 100000;
        }

        vm.subtract = function() {
            vm.amount = (Number(vm.amount) - 1) >= 1 ? Number(vm.amount) - 1 : 1;
        }

        vm.stopLongPress = function(){
          vm.proposal.amount = vm.amount;
          proposalService.setPropertyValue('amount', vm.proposal.amount);
        }

        function init(){
        }

        init();

    }
})();
