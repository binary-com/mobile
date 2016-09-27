/**
 * @name header controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/08/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components')
    .controller('HeaderController', Header);

  Header.$inject = ['$scope', '$state', '$ionicSideMenuDelegate'];

  function Header($scope, $state, $ionicSideMenuDelegate){
    var vm = this;
    vm.hideMenuButton = false;
    vm.showBack = false;
    $ionicSideMenuDelegate.canDragContent(false);

    vm.toggleSideMenu = function(){
      $ionicSideMenuDelegate.toggleLeft();
    }

    $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        vm.to = to;
        vm.from = from;
        if(vm.to.name == 'transactiondetail'){
          vm.hideMenuButton = true;
          vm.showBack = true;
        }
        else{
          vm.hideMenuButton = false;
          vm.showBack = false;
        }
    });

    // back button function
    vm.goToPrevPage = function() {
        $state.go(vm.from);
    };
  }
})();
