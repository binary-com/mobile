/**
 * @name selected tick directvie
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 06/23/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.directives").directive("bgSelectedTick", SelectedTick);

    function SelectedTick() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/options/selected-tick.template.html",
            controller      : "SelectedTickController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                select: "&",
                tick  : "="
            }
        };

        return directive;
    }
})();