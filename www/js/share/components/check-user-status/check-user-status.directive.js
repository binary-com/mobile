/**
 * @name Check User Status directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 02/15/2017
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.check-user-status.directives")
        .directive("bgCheckUserStatus", CheckUserStatus);

    function CheckUserStatus() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/check-user-status/check-user-status.template.html",
            controller      : "CheckUserStatusController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {}
        };
        return directive;
    }
})();
