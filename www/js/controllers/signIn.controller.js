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
		function($scope, $state, tokenService, languageService, websocketService, tradeService) {


			var init = function() {
				//websocketService.init(languageService.read());
				if (tokenService.defaultTokenExist()){
					tokenService.validateDefaultToken();
				}
			};

			$scope.$on('authorize', function(e, response) {
				if (response && response.token) {
					tokenService.saveInList(response.token);
					languageService.load(); // rename it
					//tradeService.sendProposal();
					websocketService.sendRequestFor.currencies();
					websocketService.sendRequestFor.symbols();
					$state.go('trade');
				} else {
					$scope.tokenError = true;
				}
			});

			init();

			$scope.signIn = function(_token) {
				var language = $('.language option:selected').val();
				languageService.update(language);

				$scope.tokenError = false;

				if(_token && _token.length === 15) {
					tokenService.updateDefaultToken(_token);
					tokenService.validateToken();
				} else {
					$scope.tokenError = true;
				}
			};

			$scope.navigateToHelpPage = function() {
				$state.go('help');
			};

	});
