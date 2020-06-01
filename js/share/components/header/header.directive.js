/**
 * @name header directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/07/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.share.components").directive("bgHeader", Header);

    function Header() {
        const directive = {
            link,
            templateUrl     : "js/share/components/header/header.template.html",
            retrict         : "A",
            controller      : "HeaderController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                spinLogo: "="
            }
        };

        function link() {}

        return directive;
    }
})();
