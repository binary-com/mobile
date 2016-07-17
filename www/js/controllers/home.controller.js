/**
 * @name HomeController
 * @author Massih Hazrati
 * @contributors []
 * @since 11/16/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.controller('HomeController',
		function($scope, $state, websocketService, accountService) {
			var init = function() {

                // send track view to Google Analytics
                analyticsService.google.trackView("Home");

                // Check that is saved any default account or not
				if (accountService.hasDefault()) {
                    // Login to the server if there is any default account
					accountService.validate();
				} else {
					$state.go('signin');
				}
			};

			init();

			/**
             * wait untile authorization and decide 
             * to redirect user  to the proper page
             */
            $scope.$on('authorize', function(e, response) {
				if (response) {
					$state.go('options');
				} else {
					$state.go('signin');
				}
			});
	});
