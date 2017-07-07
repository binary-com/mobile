/**
 * @name Notification Icon controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/03/2017
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.notification-icon.controllers")
        .controller("NotificationIconController", NotificationIcon);

    NotificationIcon.$inject = ["$scope", "$state", "$ionicHistory", "notificationService", "appStateService"];

    function NotificationIcon($scope, $state, $ionicHistory, notificationService, appStateService) {
        const vm = this;
        $scope.$watch(
            () => notificationService.notices,
            () => {
                vm.notices = notificationService.notices;
            }
        );

        $scope.$watch(
            () => appStateService.purchaseMode,
            () => {
                vm.disableMenuButton = appStateService.purchaseMode;
            }
        );

        vm.goToNotifications = function() {
            if ($state.current.name === "notifications") {
                $ionicHistory.goBack();
            } else {
                $state.go("notifications");
            }
        };
    }
})();
