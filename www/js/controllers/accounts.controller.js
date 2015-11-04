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
		function($scope, $rootScope, $state, websocketService, accountService) {
			// Get all accounts
			$scope.accounts = accountService.getAllAccounts();

			$scope.removeAccount = function(_token) {
				accountService.removeAccount(_token);
				$scope.accounts = accountService.getAllAccounts();
			};

			$scope.setAccountAsDefault = function(_token) {
				accountService.setDefaultAccount(_token);
				$scope.accounts = accountService.getAllAccounts();
			};

			$scope.addAccount = function(_token) {
				$scope.token = "";
				$scope.tokenError = false;
				// Validate the token
				if (_token && _token.length === 15) {
					$scope.newToken = _token;

					accountService.validateAccount(_token);
				} else {
					// apply error class to the input
					$scope.tokenError = true;
				}
			};

			$scope.removeAllAccounts = function() {
				accountService.removeAllAccounts();
				$state.go('sign-in');
			};

			$scope.$on('authorize', function(e, response) {
				if (response) {
					// add it to the token list
					response.token = $scope.newToken;
					accountService.addAccount(response);
					$scope.accounts = accountService.getAllAccounts();
					$scope.$apply();
				} else {
					$scope.tokenError = true;
				}
			});

			// TODO: rename to navigateToOptionsPage
			$scope.back = function() {
				$rootScope.$broadcast('refresh:options');
				$state.go('options');
			};
	});
