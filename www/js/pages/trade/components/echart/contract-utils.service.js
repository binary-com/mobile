/**
 * @name contract factory.service
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

    factory.setObjValue = function (obj, attr, value, condition) {
      if (!_.isEmpty(obj)) {
        if (angular.isDefined(condition)) {
          if (condition) {
            obj[attr] = value;
          }
        } else if (typeof obj[attr] === 'undefined') {
          obj[attr] = value;
        }
      }
    };

    factory.getISODate = function(epoch){
      return new Date(epoch * 1000).toISOString();
    };

		factory.fractionalLength = function (floatNumber) {
					var stringNumber = floatNumber.toString(),
						decimalLength = stringNumber.indexOf('.');
					return stringNumber.length - decimalLength - 1;
    };

    factory.isDigitTrade = function (contract) {
      if (contract.type.indexOf('DIGIT') === 0) {
        return true;
      }
      return false;
    };

    factory.isAsianGame = function (contract){
      if(contract.type.indexOf('ASIAN') === 0){
        return true;
      }
      return false;
    };

    factory.isHigherLowerTrade = function (contract){
      if(['PUTHL', 'CALLHL'].indexOf(contract.type) > -1 && !_.isEmpty(contract.barrier)){
        return true;
      }
      return false;
    };

    factory.lastDigit = function lastDigit(num) {
      return parseInt(num.toString()
          .slice(-1)[0]);
    };
    factory.average = function average(ticks){
      var list = [];
      ticks.forEach((tick) => {
        list.push(tick.quote * 1);
      });
      var decimalPointLength = factory.fractionalLength(list[0]) + 1;
      return parseFloat(list.reduce(function(a, b){ return a + b;}, 0) / list.length).toFixed(decimalPointLength);
    };

    factory.conditions = {
      CALL: function condition(barrier, price) {
        return parseFloat(price) > parseFloat(barrier);
      },
      PUT: function condition(barrier, price) {
        return parseFloat(price) < parseFloat(barrier);
      },
      CALLHL: function condition(barrier, price) { // Higher/Lower CALL
        return parseFloat(price) > parseFloat(barrier);
      },
      PUTHL: function condition(barrier, price) { // Higher/Lower PUT
        return parseFloat(price) < parseFloat(barrier);
      },
      DIGITMATCH: function condition(barrier, price) {
        return factory.lastDigit(barrier) === factory.lastDigit(price);
      },
      DIGITDIFF: function condition(barrier, price) {
        return factory.lastDigit(barrier) !== factory.lastDigit(price);
      },
      DIGITEVEN: function condition(barrier, price) {
        return factory.lastDigit(price) % 2 === 0;
      },
      DIGITODD: function condition(barrier, price) {
        return factory.lastDigit(price) % 2 !== 0;
      },
      DIGITUNDER: function condition(barrier, price) {
        return factory.lastDigit(price) < parseInt(barrier);
      },
      DIGITOVER: function condition(barrier, price) {
        return factory.lastDigit(price) > parseInt(barrier);
      },
      ASIANU: function condition(barrier, price, priceList){
        var avg = factory.average(priceList);

        return parseFloat(price) > avg;
      },
      ASIAND: function condition(barrier, price, priceList){
        var avg = factory.average(priceList);

        return parseFloat(price) < avg;
      }
    };

    return factory;

  }
})();
