/**
 * @name underlyings directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/25/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.directives").directive("bgUnderlyings", Underlying);

    function Underlying() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/options/underlyings.template.html",
            controller      : "UnderlyingsController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                market: "=",
                select: "&"
            }
        };

        return directive;
    }
})();
