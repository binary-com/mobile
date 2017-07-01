/**
 * @name markets directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/20/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.directives").directive("bgMarkets", Markets);

    function Markets() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/options/markets.template.html",
            controller      : "MarketsController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                select: "&"
            }
        };

        return directive;
    }
})();
