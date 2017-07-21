/**
 * @name reality-check directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.reality-check.directives").directive("bgRealityCheck", RealityCheck);

    function RealityCheck() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/reality-check/reality-check.template.html",
            controller      : "RealityCheckController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {}
        };
        return directive;
    }
})();
