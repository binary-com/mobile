/**
 * @name Service Outage directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 05/06/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.service-outage.directives").directive("bgServiceOutage", ServiceOutage);

    function ServiceOutage() {
        const directive = {
            restrict  : "E",
            scope     : {},
            controller: "ServiceOutageController"
        };

        return directive;
    }
})();
