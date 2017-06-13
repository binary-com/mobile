/**
 * @name contract utils service
 * @author morteza tavnarad
 * @contributors []
 * @since 06/12/2017
 * @copyright binary ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.echart.services')
    .factory('contractUtilsService', Utils);

  Utils.$inject = [];

  function Utils() {

    var factory = {};

    factory.setObjValue: function (obj, attr, value, condition) {
      if (utils.isDefined(obj)) {
        if (utils.isDefined(condition)) {
          if (condition) {
            obj[attr] = value;
          }
        } else if (typeof obj[attr] === 'undefined') {
          obj[attr] = value;
        }
      }
    };

    factory.higherLowerTrade= function (contract){
      if(['PUTHL', 'CALLHL'].indexOf(contract.type) > -1 && !_.isEmpty(contract.barrier)){
        return true;
      }
      return false;
    };


    return factory;

  }
})();
