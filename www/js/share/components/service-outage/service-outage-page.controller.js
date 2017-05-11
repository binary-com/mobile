/**
 * @name Service Outage Page Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 05/06/2017
 * @copyright Binary Ltd
 */

(function() {
  'use strict';

  angular
    .module('binary.share.components.service-outage.controllers')
    .controller('ServiceOutagePageController', ServiceOutage);

  ServiceOutage.$inject = ['$stateParams'];

  function ServiceOutage($stateParams){
    var vm = this;

    vm.message = $stateParams.message;
  }

})();
