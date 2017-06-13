/**
 * @name contract service
 * @author morteza tavnarad
 * @contributors []
 * @since 06/12/2017
 * @copyright binary ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.echart.services')
    .factory('contractService', ContractService);

  ContractService.$inject = ['contractUtilsService'];

  function ContractService(utils){
    var factory = {};

    var ticks = [];

    factory.init = function(contract) {
      return new Contract(contract);
    }

    function Contract(contract){

      var hasEntrySpot = function() {
        if (!_.isEmpty(contract.entrySpot)) {
          return true;
        } else {
          return false;
        }
      };

      var hasExitSpot = function hasExitSpot() {
        if (!_.isEmpty(contract.exitSpot)) {
          return true;
        } else {
          return false;
        }
      };

      var betweenExistingSpots = function betweenExistingSpots(tick) {
        if (hasEntrySpot() && tick.epoch >= contract.entrySpot.epoch && (!hasExitSpot() || time <= contract.exitSpot.epoch)) {
          return true;
        } else {
          return false;
        }
      };

      var isEntrySpot = function (tick) {
        if (hasEntrySpot()) {
          if (tick.epoch === contract.entrySpot.epoch) {
            return true;
          } else {
            return false;
          }
        } else {
          if (time >= contract.startTime) {
            return true;
          } else {
            return false;
          }
        }
      };

      var isExitSpot = function isExitSpot(tick) {
        if (hasExitSpot()) {
          if (tick.epoch === contract.exitSpot.epoch) {
            return true;
          } else {
            return false;
          }
        } else {
          if (hasEntrySpot() && tick.epoch === contract.entrySpotIndex + contract.duration) {
            return true;
          } else {
            return false;
          }
        }
      };


      this.addSpot = function(tick){

        if (isEntrySpot(tickTime) || betweenExistingSpots(tickTime)) {
          if (isEntrySpot(tickTime)) {
            var barrier = tickPrice;
            if(utils.higherLowerTrade(contract)){
              contract.offset = contract.offset || contract.barrier;
              barrier = Number(tickPrice) + Number(contract.offset);
              barrier = barrier.toFixed(utils.fractionalLength(tickPrice));
            }
            utils.setObjValue(contract, 'barrier', barrier, !utils.digitTrade(contract));
            utils.setObjValue(contract, 'entrySpotPrice', tickPrice, true);
            utils.setObjValue(contract, 'entrySpotTime', tickTime, !hasEntrySpot());
          } else if (isExitSpot(tickTime, index)) {
            utils.setObjValue(contract, 'exitSpot', tickTime, !hasExitSpot());
          }
          ticks.push(tick);
        }

    }

    return factory;
  }
})();
