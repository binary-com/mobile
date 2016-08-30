angular
	.module('binary')
	.controller('ProfitTableController',
		function($scope, $state, config, proposalService,
            accountService, websocketService, delayService,
            appStateService, analyticsService) {
							// back button
							$scope.navigateToOptions = function() {
								$state.go('options');
							}
						});
