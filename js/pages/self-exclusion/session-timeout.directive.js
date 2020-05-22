/**
 * @name session-timout directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 02/04/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.self-exclusion.directives").directive("bgSessionTimeout", SessionTimeout);

    function SessionTimeout() {
        const directive = {
            restrict    : "E",
            scope       : {},
            controller  : "SessionTimeoutController",
            controllerAs: "vm"
        };

        return directive;
    }
})();
