/**
 * @name signin
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 * @description directive used to display the login form
 */

angular
	.module('binary')
	.directive('signin',[
		'accountService',
		'languageService',
		'websocketService',
		'alertService',
		'$state',
		'$ionicPopup',
		function(accountService,
				languageService,
				websocketService,
				alertService,
				$state,
				$ionicPopup) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/accounts/signin.template.html',
			link: function(scope, element) {

				/**
				 * On load:
				 * Open the websocket
				 * If default account is set, send it for validation
				 */
				var init = function() {
					websocketService.init();
					if (accountService.hasDefault()) {
						accountService.validate();
					}
					websocketService.sendRequestFor.symbols();
					websocketService.sendRequestFor.assetIndex();
				};

				init();


				scope.$on('authorize', function(e, response) {
					scope.showSpinner = false;
					if (response) {
						if (accountService.isUnique(response.loginid)) {
							accountService.add(response);
							accountService.setDefault(response.token);
						}

						languageService.set();
						scope.token = '';

						$state.go('options');
					} else {
						alertService.accountError.tokenNotAuthenticated();
					}
				});

				/**
				 * SignIn button: event handler
				 * @param  {String} _token 15char token
				 */
				scope.signIn = function() {
					var _token = scope.token;
					// Set the user's language
					var language = $('.language option:selected').val();
					languageService.update(language);

					// Validate the token
					scope.showSpinner = false;
					if(_token && _token.length === 15) {
						scope.showSpinner = true;
						//accountService.validate(_token);
					} else {
						alertService.accountError.tokenNotValid();
					}
				};
			}
		};
	}]);



















