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
		'$state',
		function(accountService, alertService, $state) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/manage-accounts.template.html',
			link: function(scope, element) {

				scope.accounts = accountService.getAll();

				scope.$on('authorize', function(e, response) {
					// TODO: Add spinner
					scope.showSpinner = false;
					if (response) {
						if (accountService.isUnique(response.loginid)) {
							accountService.add(response);
							scope.accounts = accountService.getAll();
							scope.$apply();
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
					accountService.remove(_token);
					scope.accounts = accountService.getAll();
				};

				scope.setAccountAsDefault = function(_token) {
					scope.settingDefault = true;
					accountService.setDefault(_token);
					accountService.validate();
					scope.accounts = accountService.getAll();
				};

				scope.removeAllAccounts = function() {
					accountService.removeAll();
					$state.go('signin');
				};
			}
		};
	}]);
