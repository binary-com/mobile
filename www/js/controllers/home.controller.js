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
		function($scope, $state, accountService, localStorageService, analyticsService) {
			var init = function() {
                $scope.hasWSUrl = true;
                $scope.wsUrl = "wss://www2.binaryws.com/websockets/v3";
                $scope.appId = 10;
 
                if(!localStorageService.getWSUrl()){
                    $scope.$applyAsync(function(){
                        $scope.hasWSUrl = false;
                    });
                   return;
                }

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

            $scope.save = function(_wsUrl, _appId){
                localStorageService.setWSUrl(_wsUrl);
                localStorageService.setAppId(_appId);
                init();
            }

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
