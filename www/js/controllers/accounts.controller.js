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
		function($scope, $state, websocketService, storageService) {
			// read list of accounts
			$scope.accounts = storageService.token.get();

			$scope.removeAccount = function(_token) {
				storageService.token.remove(_token);
				$scope.accounts = storageService.token.get();
			};

			$scope.addAccount = function(_token) {
				$scope.tokenError = false;
				// Validate the token
				if (_token && _token.length === 15) {
					$scope.newToken = _token;
					websocketService.send.authentication(_token);
				} else {
					// apply error class to the input
					$scope.tokenError = true;
				}
			};

			$scope.$on('authorize', function(e, response) {
				if (response) {
					// add it to the token list
					storageService.token.add($scope.newToken);
					$scope.accounts = storageService.token.get();
				} else {
					$scope.tokenError = true;
				}
			});

			$scope.back = function() {

				$state.go('options');
			};
	});
