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

    Payout.$inject = [];

    function Payout(){
        var vm = this;


        vm.changePayoutType = function(){
            if(vm.proposal.basis === "payout"){
                vm.proposal.basis = "stake";
            } else {
                vm.proposal.basis = "payout";
            }
        }
        
        function init(){
        }

        init();

    }
})();
