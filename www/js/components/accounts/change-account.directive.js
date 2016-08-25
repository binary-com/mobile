/**
 * @name changeAccount
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('changeAccount',[
		'accountService',
		'websocketService',
		'$state',
        'appStateService',
		function(accountService, websocketService, $state, appStateService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/accounts/change-account.template.html',
			link: function(scope, element) {
				/**
				 * On load:
				 * Open the websocket
				 * If default account is set, send it for validation
				 */
				var init = function() {
					scope.accounts = accountService.getAll();
					scope.selectedAccount = accountService.getDefault().token;
				};

                var updateSymbols = function(){
                    // Wait untile the login progress is finished
                    if(!appStateService.isLoggedin){
                        setTimeout(updateSymbols, 500);
                    }
                    else{
                        websocketService.sendRequestFor.symbols();
                        websocketService.sendRequestFor.assetIndex();
                    }
                };

				init();

				scope.updateAccount = function(_selectedAccount) {
										appStateService.isChangedAccount = true;
										appStateService.isCheckedAccountType = false;
										sessionStorage.removeItem('start');
										sessionStorage.removeItem('_interval');
                    scope.setDataLoaded(false);
					accountService.setDefault(_selectedAccount);
					accountService.validate();
                    updateSymbols();

				};

				scope.navigateToManageAccounts = function() {
					$state.go('accounts');
				};


			}
		};
	}]);
