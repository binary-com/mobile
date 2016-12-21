/**
 * @name Connection Lost directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/19/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.connectivity.directives')
    .directive('bgConnectionLost', ConnectionLost);

  function ConnectionLost(){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/share/components/connectivity/connection-lost.template.html',
      controller: 'ConnectionLostController',
      controllerAs: 'vm',
      scope: {}
    };

    return directive;
  }
});
