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
		function($scope, $state, appStateService, localStorageService, analyticsService) {

            analyticsService.google.trackView("Singin");

            appStateService.invalidTokenRemoved = false;

            if(!localStorageService.getWSUrl()){
                $state.go('home');
            }

			$scope.navigateToHelpPage = function() {
				$state.go('help');
			};
	});
