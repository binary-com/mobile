/**
 * @name notificationService
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/03/2017
 * @copyright Binary Ltd
 */

angular
  .module('binary')
  .service('notificationService',
    function() {
      this.notices = new Array();
    });
