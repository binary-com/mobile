/**
 * @name Profile Module
 * @author Morteza Tavanarad
 * @contributors []
 * @since 11/21/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.profile.controllers')
    .controller('ProfileController', Profile);

  Profile.$inject = ['$scope', '$translate', 'alertService',
                     'appStateService', 'websocketService'];

  function Profile($scope, $translate, alertService,
      appStateService, websocketService){
    var vm = this;
    vm.disableUpdateButton = true;

    $scope.$on('get_settings', (e, response) => {
      $scope.$applyAsync(()=>{
        vm.profile = response;
        vm.disableUpdateButton = false;
      });
    });

    $scope.$on('set-settings', (e, response) => {
      if(response){
        $translate(['profile.success', 'profile.success_message'])
          .then((translation) => {
            alertService.displayAlert(translation['profile.success'],
                translation['profile.success_message']);
          });
      }
      else {
        $translate('profile.error_message')
          .then((translation) => {
            alertService.displayError(translation['profile.error_message']);
          });
      }
      vm.disableUpdateButton = false;
    });

    $scope.$on('set-settings:error', (e, message) => {
      alertService.displayError(message);
      vm.disableUpdateButton = false;
    });

    $scope.$on('authorize', (e, response) => {
      init();
    });

    init();

    vm.submit = function(){
      vm.disableUpdateButton = true;
      updateProfile();
    };

    function getProfile(){
      websocketService.sendRequestFor.accountSetting();
    }

    function updateProfile(){
      var address = {
        address_line_1: vm.profile.address_line_1,
        address_line_2: vm.profile.address_line_2,
        address_city: vm.profile.address_city,
        address_state: vm.profile.address_state,
        address_postcode: vm.profile.address_postcode,
        phone: vm.profile.phone
      };

      websocketService.sendRequestFor.setAccountSettings(address);
    }

    function init(){
      getProfile();
      vm.isVirtualAccount = appStateService.virtuality;
    }
  }
})();
