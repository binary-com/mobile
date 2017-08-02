/**
 * @name barrier directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 09/19/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.directives").directive("bgBarrier", Barrier);

    function Barrier() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/options/barrier.template.html",
            controller      : "BarrierController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal: "="
            }
        };

        return directive;
    }
})();
