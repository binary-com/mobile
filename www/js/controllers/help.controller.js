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

			if(typeof(analytics) !== "undefined"){
					analytics.trackView("Help");
			}

			$scope.backToSignInPage = function() {
				$state.go('signin');
			};

			$scope.openExternal = function($event){
				window.open($event.currentTarget.href, "_system");
				return false;
			}
	});
