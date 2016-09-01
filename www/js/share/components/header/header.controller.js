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

  Header.$inject = ['$ionicSideMenuDelegate'];

  function Header($ionicSideMenuDelegate){
    var vm = this;
    $ionicSideMenuDelegate.canDragContent(false);

    vm.toggleSideMenu = function(){
      $ionicSideMenuDelegate.toggleLeft();
    }
  }
})();
