/**
 * @name Notification Icon directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/03/2017
 * @copyright Binary Ltd
 * Application NotificationIcon
 */

(function() {
    angular
        .module("binary.share.components.notification-icon.directives")
        .directive("bgNotificationIcon", NotificationIcon);

    function NotificationIcon() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/notification-icon/notification-icon.template.html",
            controller      : "NotificationIconController",
            controllerAs    : "vm",
            scope           : {},
            bindToController: true
        };

        return directive;
    }
})();
