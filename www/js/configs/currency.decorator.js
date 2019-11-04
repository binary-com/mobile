/**
 * @name currency filter decorator
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/21/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary").config(Currency);

    Currency.$inject = ["$provide"];

    function Currency($provide) {
        $provide.decorator("currencyFilter", [
            "accountService",
            function(accountService) {
                // const srcFilter = $delegate;

                const extendsFilter = function() {
                    const locale = (localStorage.language || "en").replace("_", "-").slice(0, 2);
                    const currency = arguments[1] ||
                        (accountService.getDefault() ? accountService.getDefault().currency : null);

                    if (isNaN(arguments[0])) {
                        return '--';
                    }
                    if(_.isEmpty(currency)){
                        return "";
                    }

                    return formatMoney(locale, currency, arguments[0]);
                };

                function formatMoney(locale, currency, value) {
                    const options = {
                        style   : "currency",
                        currency: currency || "USD"
                    };

                    if (/btc|xbt|ltc|bch|eth/i.test(currency)) {
                        options.minimumFractionDigits = 8;
                        options.maximumFractionDigits = 8;
                    }

                    return Intl.NumberFormat(locale, options).format(value);
                }
                /*
                const moneySigns = {
                    USD: "$",
                    GBP: "£",
                    AUD: "A$",
                    EUR: "€",
                    JPY: "¥"
                };
                */
                return extendsFilter;
            }
        ]);
    }
})();
