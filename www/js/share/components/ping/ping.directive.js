/**
 * @name ping directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.ping.directives')
    .directive('ping', Ping);

  function Ping(){
    var directive = {
      restrict: 'E',
      controller: 'PingController',
      controllerAs: 'vm',
      scope: {}
    };

    return directive;
  }
})();
