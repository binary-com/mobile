/**
 * @name ticks directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/26/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.trade.components.options.controllers')
        .controller('TicksController', Ticks);

    Ticks.$inject = [];

    function Ticks(){
        var vm = this;

        vm.min = 0;
        vm.max = 0;
        vm.tickRange = [];

        vm.selectTick = function(tick){
            vm.select()(tick);
        }

        function init(){
           var tradeType = JSON.parse(sessionStorage.tradeTypes)[vm.tradeType][0];
           vm.min = Number.parseInt(getTickValue(tradeType.min_contract_duration));
           vm.max = Number.parseInt(getTickValue(tradeType.max_contract_duration));

           vm.tickRange = _.range(vm.min, vm.max+1);
        }

        function getTickValue(tick){
            return tick.slice(0, -1);
        }

        init();


    }
})();
