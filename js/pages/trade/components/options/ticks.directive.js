/**
 * @name ticks directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/26/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.directives").directive("bgTicks", Ticks);

    function Ticks() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/options/ticks.template.html",
            controller      : "TicksController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                select   : "&",
                tradeType: "="
            }
        };

        return directive;
    }
})();
