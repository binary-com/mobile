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
        var locale = (localStorage.language || "en").replace('_', '-');
        var currency = arguments[1] || 'USD';
        return formatMoney(locale, currency, arguments[0]);
      };

      function formatMoney (locale, currency, value) {
        return Intl.NumberFormat(locale,
            {
              style: 'currency',
              currency: currency || 'USD'
            })
        .format(value);
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
