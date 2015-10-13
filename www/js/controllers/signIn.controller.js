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
	.controller('SignInController',
		function($scope, $state) {

			$scope.signIn = function() {
				$state.go('trade');
			};

			$scope.goToHelpPage = function() {
				$state.go('help');
			};
	});
