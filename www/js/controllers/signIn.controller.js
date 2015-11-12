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
		function($scope, $state) {


			// var init = function() {
			// 	websocketService.init();
			// 	if (accountService.hasDefaultAccount()){
			// 		accountService.validateAccount();
			// 	}
			// };

			// $scope.$on('authorize', function(e, response) {
			// 	if (response) {
			// 		accountService.addAccount(response);
			// 		accountService.setDefaultAccount(response.token);
			// 		// TODO: Rename it - refactor languageService
			// 		languageService.load();
			// 		tradeService.sendProposal();
			// 		websocketService.sendRequestFor.currencies();
			// 		websocketService.sendRequestFor.symbols();
			// 		$state.go('trade');
			// 	} else {
			// 		$scope.tokenError = true;
			// 	}
			// });

			//init();

			// $scope.signIn = function(_token) {
			// 	var language = $('.language option:selected').val();
			// 	// TODO: Rename it - refactor languageService
			// 	languageService.update(language);

			// 	$scope.tokenError = false;

			// 	if(_token && _token.length === 15) {
			// 		accountService.validateAccount(_token);
			// 	} else {
			// 		$scope.tokenError = true;
			// 	}
			// };

			$scope.navigateToHelpPage = function() {
				$state.go('help');
			};

	});
