/**
 * @name tick result directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 06/30/2018
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.chart.directives").directive("bgTickResult", TickResult);

    function TickResult() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/chart/tick-result.template.html",
            controller      : "TickResultController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {}
        };

        return directive;
    }
})();
