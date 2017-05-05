/**
 * @name Notification Icon controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/03/2017
 * @copyright Binary Ltd
 */

(function() {
  'use strict';

  angular
    .module('binary.share.components.notification-icon.controllers')
    .controller('NotificationIconController', NotificationIcon);

  NotificationIcon.$inject = ['$scope', 'notificationService'];

  function NotificationIcon($scope, notificationService) {
    var vm = this;
    $scope.$watch(
      () => {
      return notificationService.notices
    },
      () => {
      vm.notices = notificationService.notices;
    }
  );

  }
})();
