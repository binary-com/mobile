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
		function($scope, $rootScope, $state, $window, $ionicPopup, websocketService, accountService) {

			if(typeof(analytics) !== "undefined"){
					analytics.trackView("Account Management");
			}

			$scope.navigateToOptionsPage = function() {
				$state.go('options', {}, {reload: true});
			};

			$scope.$on('connection:reopened', function(e) {
				if (accountService.hasDefault()) {
					accountService.validate();
				}
				$window.location.reload();
			});
	});
