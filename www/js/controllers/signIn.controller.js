/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in page
 */

angular
	.module('binary')
	.controller('SignInController',
		function($scope, $state, appStateService) {
			if(typeof(analytics) !== "undefined"){
					analytics.trackView("Singin");
			}

            appStateService.invalidTokenRemoved = false;

			$scope.navigateToHelpPage = function() {
				$state.go('help');
			};
	});
