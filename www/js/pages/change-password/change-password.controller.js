/**
 * @name Change Password controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/11/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.change-password.controllers')
        .controller('ChangePasswordController', ChangePassword);

    ChangePassword.$inject = ['$scope', '$timeout', 'websocketService', 'appStateService', 'alertService'];

    function ChangePassword($scope, $timeout, websocketService, appStateService, alertService) {
			var vm = this;
      vm.passwordEqual = false;
      vm.newPasswordHasError = false;
      vm.oldPasswordHasError = false;
      vm.hideInput = false;
      vm.hideChangedPasswordText = true;
      vm.checkPassword = function(){
        if(vm.newPassword === vm.repeatNewPassword){
          vm.passwordEqual = true;
        }
        else{
          vm.passwordEqual = false;
        }
      }

			vm.changePass = function(){
        websocketService.sendRequestFor.changePassword(vm.currentPassword, vm.newPassword);
        vm.newPasswordHasError = false;
        vm.oldPasswordHasError = false;
      }

      vm.disablePasswordChange = function(){
        if(!vm.passwordEqual || _.isEmpty(vm.newPassword) || _.isEmpty(vm.currentPassword)){
          return true;
        }
        else{
          return false;
        }
      }

      $scope.$on('change_password:success', (e, change_password) => {
        appStateService.passwordChanged = true;
        $scope.$applyAsync(() => {
          vm.hideInput = true;
          vm.hideChangedPasswordText = false;
        });

        $timeout(function(){
          websocketService.logout();
        }, 5000);

      });


      $scope.$on('change_password:error', (e, error) => {
        if(error.hasOwnProperty('details')){
          if(error.details.hasOwnProperty('new_password')){
            $scope.$applyAsync(() => {
              vm.newPasswordHasError = true;
            });
          }
          if(error.details.hasOwnProperty('old_password')){
            $scope.$applyAsync(() => {
              vm.oldPasswordHasError = true;
            });
          }
        }
        else{
          alertService.displayError(error.message);
        }
      });

    }
})();
