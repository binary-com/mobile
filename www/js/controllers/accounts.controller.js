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
		function($scope, $rootScope, $state, websocketService, tokenService) {
			// read list of accounts
			$scope.accounts = tokenService.getAllTokens();

			$scope.removeAccount = function(_token) {
				tokenService.removeFromList(_token);
				$scope.accounts = tokenService.getAllTokens();
			};

			$scope.addAccount = function(_token) {
				$scope.tokenError = false;
				// Validate the token
				if (_token && _token.length === 15) {
					$scope.newToken = _token;
					tokenService.validateToken(_token);
				} else {
					// apply error class to the input
					$scope.tokenError = true;
				}
			};

			$scope.$on('authorize', function(e, response) {
				if (response) {
					// add it to the token list
					tokenService.saveInList($scope.newToken);
					$scope.accounts = tokenService.getAllTokens();
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
