/**
 * @name Connection Lost Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/19/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.connectivity.controllers')
    .controller('ConnectionLostController', ConnectionLost);

  ConnectionLost.$inject = ['$scope'];

  function ConnectionLost($scope){
    var vm = this;

    vm.showMessage = false;

    $scope.$on('connection:ready', (e)=>{
      $scope.$applyAsync(()=>{
        vm.showMessage = false;
      });
    });

    $scope.$on('connection:error', (e)=>{
      $scope.$applyAsync(()=>{
        vm.showMessage = true;
      });
    });
  }
})();
