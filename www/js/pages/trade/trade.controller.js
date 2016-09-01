/**
 * @name trade controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.controllers')
        .controller('TradeController', Trade);

    Trade.$inject = [
        '$scope', 'proposalService',
        'tradeService', 'websocketService'
    ];

    function Trade($scope, proposalService,
            tradeService, websocketService){
        var vm = this;

        vm.proposal = {};
        vm.purchasedContract = {};

        function init() {
                vm.proposal = proposalService.get();
        }


        init();
    }
})();
