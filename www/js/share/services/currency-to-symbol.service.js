/**
 * @name curency to symbol serivce
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

// Taken with modifications from:
//    https://github.com/bengourley/currency-symbol-map/blob/master/map.js
// When we need to handle more currencies please look there.
angular
    .module('binary')
    .factory('currencyToSymbolService', function() {
        var factory = {};

        factory.formatMoney = function(currency, amount) {
            var updatedAmount = amount;
            if (currency === 'JPY') { // remove decimal points for JPY and add comma.
                updatedAmount = updatedAmount.replace(/\.\d+$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }

            var symbol = format_money[currency];
            if (symbol === undefined) {
                return currency + ' ' + updatedAmount;
            }
            return symbol + updatedAmount;
        }
        var format_money = {
            "USD": "$",
            "GBP": "£",
            "AUD": "A$",
            "EUR": "€",
            "JPY": "¥",
        };

        return factory;
    });
