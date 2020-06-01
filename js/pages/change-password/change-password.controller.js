/**
 * @name Change Password controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/11/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.change-password.controllers").controller("ChangePasswordController", ChangePassword);

    ChangePassword.$inject = ["$scope", "$timeout", "websocketService", "appStateService", "alertService", "validationService"];

    function ChangePassword($scope, $timeout, websocketService, appStateService, alertService, validationService) {
        const vm = this;
        vm.validation = validationService;
        vm.passwordEqual = false;
        vm.newPasswordHasError = false;
        vm.oldPasswordHasError = false;
        vm.hideInput = false;
        vm.hideChangedPasswordText = true;

        vm.checkPassword = () => {
            $scope.$applyAsync(() => {
                vm.passwordEqual = vm.newPassword === vm.repeatNewPassword;
            });
        };

        vm.changePass = () => {
            websocketService.sendRequestFor.changePassword(vm.currentPassword, vm.newPassword);
            vm.newPasswordHasError = false;
            vm.oldPasswordHasError = false;
            vm.passwordUpdating = true;
        };

        $scope.$on("change_password:success", (e, change_password) => {
            appStateService.passwordChanged = true;
            vm.passwordUpdating = false;
            $scope.$applyAsync(() => {
                vm.hideInput = true;
                vm.hideChangedPasswordText = false;
            });
            $timeout(() => {
                websocketService.logout();
            }, 5000);
        });

        $scope.$on("change_password:error", (e, error) => {
            vm.passwordUpdating = false;
            if (error.hasOwnProperty("details")) {
                if (error.details.hasOwnProperty("new_password")) {
                    $scope.$applyAsync(() => {
                        vm.newPasswordHasError = true;
                        vm.newPasswordError = error.details.new_password;
                    });
                }
                if (error.details.hasOwnProperty("old_password")) {
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
