/**
 * @name HelpController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles help's functionalities (wizard/how to)
 */

angular
	.module('binary')
	.controller('HelpController',
		function($scope, $state) {

			$scope.backToSignInPage = function() {
				$state.go('signin');
			};
	});
