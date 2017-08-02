/**
 * @name options directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/21/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.directives").directive("bgOptions", Options);

    function Options() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/options/options.template.html",
            controller      : "OptionsController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal: "="
            }
        };

        return directive;
    }
})();
