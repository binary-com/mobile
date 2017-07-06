/**
 * @name Notifications controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/02/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.notifications.controllers").controller("NotificationsController", Notifications);

    Notifications.$inject = ["$scope", "appStateService", "notificationService"];

    function Notifications($scope, appStateService, notificationService) {
        const vm = this;
        $scope.$watch(
            () => notificationService.notices,
            () => {
                vm.notices = notificationService.notices;
            }
        );
    }
})();
