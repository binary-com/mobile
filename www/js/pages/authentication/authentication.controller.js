/**
 * @name authentication controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 04/27/2017
 * @copyright Binary Ltd
 */

(function() {
  'use strict';

  angular
    .module('binary.pages.authentication.controllers')
    .controller('AuthenticationController', Authentication);

  Authentication.$inject = ['$scope'];

  function Authentication($scope) {
    var vm = this;

  }
})();
