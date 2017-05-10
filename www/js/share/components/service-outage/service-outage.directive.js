/**
 * @name Service Outage directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 05/06/2017
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.service-outage.directives')
    .directive('bgServiceOutage', ServiceOutage);

  function ServiceOutage(){
    var directive = {
      restrict: 'E',
      scope: {},
      controller: 'ServiceOutageController',
    };

    return directive;
  }
})();
