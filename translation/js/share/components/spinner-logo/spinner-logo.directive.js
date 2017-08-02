/**
 * @name spinner-logo direcvtive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/17/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.spinner-logo.directives").directive("bgSpinnerLogo", SpinnerLogo);

    function SpinnerLogo() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/spinner-logo/spinner-logo.template.html",
            replace         : true,
            controller      : "SpinnerLogoController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {}
        };

        return directive;
    }
})();
