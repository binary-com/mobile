/**
 * @name currency filter decorator
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/21/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary')
    .config(Currency);

  Currency.$inject = ['$provide'];

  function Currency($provide){
    $provide.decorator('currencyFilter', ['$delegate', function($delegate){
      var srcFilter = $delegate;

      var extendsFilter = function(){
        arguments[1] = arguments[1] ? formatMoney(arguments[1]) : arguments[1];
        return srcFilter.apply(this, arguments);
      };

      function formatMoney (currency) {
        var symbol = format_money[currency] || currency;
        return symbol;
      }
      var format_money = {
        "USD": "$",
        "GBP": "£",
        "AUD": "A$",
        "EUR": "€",
        "JPY": "¥",
      };
      return extendsFilter;
    }]);
  }
})();
