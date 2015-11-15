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
		'$state',
		function(accountService, $state) {
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

				init();

				scope.updateAccount = function(_selectedAccount) {
					accountService.setDefault(_selectedAccount);
					accountService.validate();
				};

				scope.navigateToManageAccounts = function() {
					$state.go('accounts');
				};


			}
		};
	}]);



















