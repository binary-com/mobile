/**
 * @name select currency directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 10/18/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.select-currency.directives").directive("bgSelectCurrency", SelectCurrency);

    function SelectCurrency() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/select-currency/select-currency.template.html",
            controller      : "SelectCurrencyController",
            controllerAs    : "vm",
            bindToController: true,
        };

        return directive;
    }
})();
