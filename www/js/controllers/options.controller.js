/**
 * @name OptionsController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles changing contract's options
 */

angular
	.module('binary')
	.controller('OptionsController',
		function($scope, $rootScope, $state, config, proposalService) {
			$scope.selected = {};

			$scope.$watch('selected', function(value){
				//console.log('scope is changing: ', value);
			}, true);

			// Navigations

			$scope.navigateToManageAccounts = function() {
				$state.go('accounts');
			};

			$scope.navigateToTradePage = function() {
				$state.go('trade');
			};

			$scope.saveChanges = function() {
				//console.log('scope.selected: ', $scope.selected);
				proposalService.update($scope.selected);
				proposalService.send();

				$state.go('trade', {}, { reload: true, inherit: false, notify: true });
				//$state.go('trade');

				//console.log('get.proposal: ', proposalService.get());
			};
	});

























