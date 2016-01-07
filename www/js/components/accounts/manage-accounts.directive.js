/**
 * @name changeAccount
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('manageAccounts',[
		'accountService',
		'alertService',
		'cleanupService',
		'$state',
		function(accountService, alertService, cleanupService, $state) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/accounts/manage-accounts.template.html',
			link: function(scope, element) {

				scope.accounts = accountService.getAll();

				scope.$on('authorize', function(e, response) {
					// TODO: Add spinner
					scope.showSpinner = false;
					if (response) {
						if (accountService.isUnique(response.loginid)) {
							accountService.add(response);
							accountService.setDefault(response.token);
							scope.accounts = accountService.getAll();
							if(!scope.$$phase){
								scope.$apply();
							}
						} else {
							if (scope.settingDefault) {
								scope.settingDefault = false;
							} else {
								alertService.accountError.tokenNotUnique();
							}
						}

					} else {
						alertService.accountError.tokenNotAuthenticated();
					}
				});

				scope.$on('token:remove', function(e, response) {
					accountService.remove(response);
					scope.accounts = accountService.getAll();
					if(!scope.$$phase){
						scope.$apply();
					}
				});

				scope.addAccount = function(_token) {
					scope.showSpinner = false;
					// Validate the token
					if (_token && _token.length === 15) {
						scope.showSpinner = true;
						accountService.validate(_token);
					} else {
						alertService.accountError.tokenNotValid();
					}
				};

				scope.removeAccount = function(_token) {
					alertService.confirmAccountRemoval(_token);
				};

				scope.setAccountAsDefault = function(_token) {
					scope.settingDefault = true;
					accountService.setDefault(_token);
					accountService.validate();
					scope.accounts = accountService.getAll();
				};
			}
		};
	}]);
