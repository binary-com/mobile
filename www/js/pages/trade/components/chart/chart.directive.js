/**
 * @name chart directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 08/29/2015
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.chart.directives").directive("bgChart", Chart);

    function Chart() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/chart/chart.template.html",
            controller      : "ChartController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal         : "=",
                purchasedContract: "="
            }
        };

        return directive;
    }
})();
