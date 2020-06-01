/**
 * @name logout directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.logout.directives").directive("bgLogout", Logout);

    function Logout() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/logout/logout.template.html",
            controller      : "LogoutController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {}
        };
        return directive;
    }
})();
