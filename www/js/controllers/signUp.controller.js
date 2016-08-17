angular
	.module('binary')
	.controller('SignUpController',
		function($scope, $state, appStateService, analyticsService, websocketService) {



			$scope.navigateToSigninPage = function(){
				$state.go('signin');
			}


							$scope.$on('verify_email', function(e, verifyEmail) {

								if (verifyEmail == 1) {
									// $state.go('virtualws');

									// $scope.forming = function(){
									// 	appStateService.showForm = true;
									// }



								} else {
								}
							});



		});
