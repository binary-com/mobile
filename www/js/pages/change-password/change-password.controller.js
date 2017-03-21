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

      vm.checkPassword = function() {
        $scope.$applyAsync( () => {
          vm.passwordEqual = vm.newPassword === vm.repeatNewPassword ? true : false;
      });
      }

      vm.changePass = function() {
        websocketService.sendRequestFor.changePassword(vm.currentPassword, vm.newPassword);
        vm.newPasswordHasError = false;
        vm.oldPasswordHasError = false;
        vm.passwrodUpdating = true;
      }

      $scope.$on('change_password:success', (e, change_password) => {
        appStateService.passwordChanged = true;
        vm.passwrodUpdating = false;
        $scope.$applyAsync(() => {
          vm.hideInput = true;
          vm.hideChangedPasswordText = false;
        });
        $timeout(() => {
          websocketService.logout();
        }, 5000);
      });

      $scope.$on('change_password:error', (e, error) => {
        vm.passwrodUpdating = false;
        if (error.hasOwnProperty('details')) {
          if (error.details.hasOwnProperty('new_password')) {
            $scope.$applyAsync(() => {
              vm.newPasswordHasError = true;
              vm.newPasswordError = error.details.new_password;
            });
          }
          if (error.details.hasOwnProperty('old_password')) {
            $scope.$applyAsync(() => {
              vm.oldPasswordHasError = true;
              vm.oldPasswordError = error.details.old_password;
            });
          }
        } else {
          alertService.displayError(error.message);
        }
      });
    }
})();
