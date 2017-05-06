/**
 * @name Notification Icon directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 05/03/2016
 * @copyright Binary Ltd
 * Application NotificationIcon
 */

(function(){
  'use strict';
  angular
    .module('binary.share.components.notification-icon.directives')
    .directive('bgNotificationIcon', NotificationIcon);

  function NotificationIcon(){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/share/components/notification-icon/notification-icon.template.html',
      controller: 'NotificationIconController',
      controllerAs: 'vm',
      scope: {},
      bindToController: true
    }

    return directive;
  }
})();
