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
		function($scope, $state, websocketService, accountService, localStorageService) {
			var init = function() {
                $scope.hasWSUrl = true;

                if(!localStorageService.getWSUrl()){
                    $scope.hasWSUrl = false;
                    return;
                }

				if(typeof(analytics) !== "undefined"){
					analytics.trackView("Home");
				}

				websocketService.init();
				if (accountService.hasDefault()) {
					accountService.validate();
				} else {
					$state.go('signin');
				}
			};

            $scope.save = function(_wsUrl){
                localStorageService.setWSUrl(_wsUrl);
                init();
            }

			init();

			$scope.$on('authorize', function(e, response) {
				if (response) {
					$state.go('options');
				} else {
					$state.go('signin');
				}
			});
	});
