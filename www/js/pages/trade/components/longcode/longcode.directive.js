/**
 * @name longcode direciive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 09/27/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.longcode.directives')
    .directive('bgLongcode', Longcode);

  function Longcode(){
    var direciive = {
      restrict: 'E',
      templateUrl: 'js/pages/trade/components/longcode/longcode.template.html',
      controller: 'LongcodeController',
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        purchasedContract: '='
      }
    };

    return direciive;
  }

})();
