/**
 * @name HomeController
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/9/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.home.controllers')
    .controller('HomeController', Home);

  Home.$inject = ['$scope', '$state', 'accountService', 'analyticsService', 'appStateService', 'websocketService'];

  function Home($scope, $state, accountService, analyticsService, appStateService, websocketService){

    var vm  = this;

    websocketService.sendRequestFor.websiteStatus();

    /**
     * wait untile authorization and decide
     * to redirect user  to the proper page
     */
    $scope.$on('authorize', (e, response) => {
      if (response) {
          $state.go('trade');
      } else {
        $state.go('signin');
      }
    });

    vm.init = function() {

      // send track view to Google Analytics
      analyticsService.google.trackView("Home");

      // Check that is saved any default account or not
      if (accountService.hasDefault()) {
        // Login to the server if there is any default account
        if(!appStateService.isLoggedin){
          accountService.validate();
        } else {
          $state.go('trade');
        }
      } else {
        $state.go('signin');
      }
    };

    vm.init();


  }
})();
