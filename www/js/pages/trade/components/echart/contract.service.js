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

  ContractService.$inject = ['$rootScope', 'contractUtilsService'];

  function ContractService($rootScope, utils){
    var factory = {};


    factory.init = function(contract) {
      if(!_.isEmpty(contract)){
        if(!utils.isDigitTrade(contract) && !utils.isAsianGame(contract)){
          contract.duration += 1;
        }
        var contractObj = new Contract(contract);

        if(contract.entrySpot){
          contractObj.addSpot(contract.entrySpot);
        }

        return contractObj;
      }
    }

    function Contract(contract){
      var ticks = [];

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
        if (hasEntrySpot() && tick.epoch >= contract.entrySpot.epoch && (!hasExitSpot() || tick.epoch <= contract.exitSpot.epoch)) {
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
          if (tick.epoch >= contract.startTime) {
            return true;
          } else {
            return false;
          }
        }
      };

      var isExitSpot = function (tick, index) {
        if (hasExitSpot()) {
          if (tick.epoch === contract.exitSpot.epoch) {
            return true;
          } else {
            return false;
          }
        } else {
          if (hasEntrySpot() && index === contract.duration) {
            return true;
          } else {
            return false;
          }
        }
      };

      var calculateContractResult = function(){
        contract.result = utils.conditions[contract.type](contract.barrier, ticks[ticks.length-1].quote, ticks) ? 'win' : 'lose';
        return contract.result;
      };

      this.isFinished = function(){
        return !_.isEmpty(contract.exitSpot);
      };


      this.addSpot = function(tick){

        if (isEntrySpot(tick) || betweenExistingSpots(tick)) {
          ticks.push(tick);

          if (isEntrySpot(tick)) {
            var barrier = tick.quote;
            if(utils.isHigherLowerTrade(contract)){
              contract.offset = contract.offset || contract.barrier;
              barrier = Number(tick.quote) + Number(contract.offset);
              barrier = barrier.toFixed(utils.fractionalLength(tick.quote));
            }
            utils.setObjValue(contract, 'barrier', barrier, !utils.isDigitTrade(contract));
//            utils.setObjValue(contract, 'entrySpotPrice', tickPrice, true);
            utils.setObjValue(contract, 'entrySpot', tick, !hasEntrySpot());
          } else if (isExitSpot(tick, ticks.length)) {
            utils.setObjValue(contract, 'exitSpot', tick, !hasExitSpot());
          }

          calculateContractResult();
          $rootScope.$broadcast('contract:spot', contract, tick.quote);


          if(this.isFinished()){
            $rootScope.$broadcast('contract:finished', contract);
            ticks = null;
          }
        }
      };

      this.getRegion = function(){
        if(!_.isEmpty(contract.entrySpot)){
          var markArea = [];

          var startPoint = {};
          startPoint.xAxis = utils.getISODate(contract.entrySpot.epoch);
          startPoint.itemStyle = {
            normal: {
              color: contract.result === 'win' ? 'green' : 'red',
              opacity: 0.5
            }
          };

          var endPoint = {};
          if(this.isFinished()){
            endPoint.xAxis = utils.getISODate(contract.exitSpot.epoch);
          }
          else {
            endPoint.xAxis = utils.getISODate(ticks[ticks.length - 1].epoch);
          }

          markArea = [ startPoint, endPoint ];

          return markArea;
        }
        return null;
      };

      this.getBarrierLine = function(){
        var barrierLine = {
          lineStyle: {
            symbol: 'none',
            normal: {
              color: '#2E8836',
              type: 'solid',
            }
          },
          label: {
            normal: {
              show: true,
              position: 'middle',
              formatter: (params) => {
                var value = params['value'];
                return 'Barrier: ' + value;
              }
            }
          }
        };

        if(this.isFinished()){
          return;
        }

        if(!utils.isDigitTrade(contract) && !utils.isAsianGame(contract)){
          barrierLine.yAxis = contract.barrier;
        }
        else if(utils.isAsianGame(contract)){
          barrierLine.yAxis = utils.average(ticks);
        }

        return barrierLine;
      };
    }

      return factory;
  }
})();
