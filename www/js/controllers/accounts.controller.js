/**
 * @name AccountController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/19/2015
 * @copyright Binary Ltd
 * Handles user's accounts
 */

angular
	.module('binary')
	.controller('AccountsController',
		function($scope, $state, websocketService, accountService, alertService,
            proposalService, appStateService, marketService) {

			if (typeof(analytics) !== "undefined") {
				analytics.trackView("Account Management");
			}

			$scope.navigateToOptionsPage = function() {
				$state.go('options', {}, {reload: true});
			};

            if(appStateService.invalidTokenRemoved){
                accountService.validate();
                appStateService.invalidTokenRemoved = false;
            }

			$scope.logout = function() {
				alertService.confirmRemoveAllAccount(
					function(res){
						if(typeof(res) !== "boolean"){
							if(res == 1)
								res = true;
							else
								res = false;
						}

						if(res){
							appStateService.isRealityChecked= false;
							appStateService.isChangedAccount = false;
							appStateService.isPopupOpen = false;
							appStateService.isCheckedAccountType = false;
							accountService.removeAll();
							proposalService.remove();
                            marketService.removeActiveSymbols();
                            marketService.removeAssetIndex();
                            appStateService.isLoggedin = false;
														sessionStorage.removeItem('start');
														sessionStorage.removeItem('_interval');
                            websocketService.closeConnection();
                            $scope.$parent.$broadcast('logout');
							$state.go('signin');
						}
					}
				);
			};

	});
