/**
 * @name balance directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function() {
  'use strict';

  angular
    .module('binary.share.components.balance.directives')
    .directive('bgBalance', Balance);

  function Balance(){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/share/components/balance/balance.template.html',
      controller: 'BalanceController',
      controllerAs: 'vm',
      bindToController: true,
      scope: {
          proposal: '=?'
      },
      link: link
    };

    function link(scope, element, attributes, vm){
      scope.$on('$destroy', () => {
        websocketService.sendRequestFor.forget(vm.balance.id);
      });
    }

    return directive;
  }
})();
