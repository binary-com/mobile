/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in functionalities
 */

angular
	.module('binary.controllers')
	.controller('SignInController', ['$scope',
		function($scope, $state) {
			$scope.language = 'EN';
			$scope.massih = 'hazrati';
			$scope.signIn = function(token, language) {
				$scope.tokenError = false;
				// Validate the token
				if (token && token.length === 48) {
					// send it for auth
					// if auth:
					// $state.go('trade');
				} else {
					// apply error class to the input
					$scope.tokenError = true;
				}
			};

			$scope.goToHelpPage = function() {
				$state.go('help');
			};

	}]);
