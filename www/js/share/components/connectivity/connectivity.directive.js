/**
 * @name Connectivity Directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/22/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.connectivity.directives')
    .directive('bgConnectivity', Connectivity);


  function Connectivity(){
    var directive = {
      restrict: 'E',
      controller: 'ConnectivityController',
      controllerAs: 'vm',
      bindToController: true,
      scope: {}
    };

    return directive;
  }
})();
