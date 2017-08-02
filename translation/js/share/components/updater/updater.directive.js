/**
 * @name updater directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/26/2015
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.updater.directives").directive("bgUpdater", Updater);

    function Updater() {
        const directive = {
            restrict    : "E",
            controller  : "UpdaterController",
            controllerAs: "vm",
            scope       : {}
        };

        return directive;
    }
})();
