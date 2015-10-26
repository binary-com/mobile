/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in functionalities
 */

angular
	.module('binary')
	.controller('SignInController',
		function($scope, $state, websocketService, storageService) {
			$scope.language = 'EN';
			// on page load if we have a last used token go to trade page directly and do other shits
			var checkTokens = function() {
				if (storageService.token.get().length > 0) {
					// use the last used token
					$state.go('trade');
				}
				console.log('login load');
			};
			$scope.signIn = function(token, language) {
				$scope.token = token;
				$scope.tokenError = false;
				// Validate the token
				if (token && token.length === 15) {
					websocketService.send.authentication(token);
				} else {
					// apply error class to the input
					$scope.tokenError = true;
				}
			};

			$scope.goToHelpPage = function() {
				$state.go('help');
			};

			$scope.$on('authorize', function(e, response) {
				if (response) {
					// add it to the token list
					console.log('token: ', $scope.token)
					storageService.token.add($scope.token);
					$state.go('trade');
				} else {
					// empty the token input
					// 'red' it
				}
			});

			//checkTokens();
	});
