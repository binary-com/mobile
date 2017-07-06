/**
 * @name payout directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.payout.directives").directive("bgPayout", Payout);

    function Payout() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/payout/payout.template.html",
            controller      : "PayoutController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal: "="
            }
        };

        return directive;
    }
})();
