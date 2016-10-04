/**
 * @name digit-result controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/01/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.chart.controllers')
    .controller('DigitResultController', Result);

  Result.$inject = ['$scope', 'chartService'];

  function Result($scope, chartService){
    var vm = this;

    vm.spots = [];
    vm.reset = true;
    vm.counter = 0;

    $scope.$on('contract:spot', (e, contract, lastPrice) => {
      if(vm.reset){
        vm.spots = new Array(contract.duration+1).fill().map((e, i) => { return {}});
        vm.reset = false;
        vm.counter = 0;
      }

      $scope.$applyAsync(()=>{
        vm.spots[vm.counter++] = {
          result: contract.result,
          value: lastPrice.toString().slice(-1)
        };
      });
    });

    $scope.$on('contract:finished', (e, contract) => {
      vm.reset = true;
    });

  }
})();
