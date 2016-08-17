angular
	.module('binary')
	.controller('RealAccountOpeningController',
		function($scope, $rootScope, $state, $timeout, $location, websocketService, appStateService, accountService, $ionicPopup, alertService, $translate, languageService, proposalService, marketService) {
			// go back to options on refresh
			if(!appStateService.isLoggedin){
				$state.go('options');
			}
			// back button
			$scope.navigateToOptions = function() {
				$state.go('options');
			}
		});
