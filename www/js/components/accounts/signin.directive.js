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
        '$compile',
        '$ionicLoading',
		function(accountService,
				languageService,
				websocketService,
				alertService,
				$state,
				$ionicPopup,
                $compile,
                $ionicLoading) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/accounts/signin.template.html',
			link: function(scope, element) {

                scope.showTokenForm = false;
                scope.showSignin = false;

				/**
				 * On load:
				 * Open the websocket
				 * If default account is set, send it for validation
				 */
				var init = function() {
					//websocketService.init();
					scope.language = languageService.read();
				};

				init();


				scope.$on('authorize', function(e, response) {
                    
                    $ionicLoading.hide();

					if (response) {
						if (accountService.isUnique(response.loginid)) {
							accountService.add(response);
							accountService.setDefault(response.token);
						}

						//languageService.set();
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
					//languageService.update(scope.language);

					// Validate the token
					if(_token && _token.length === 15) {

                        $ionicLoading.show();

						websocketService.authenticate(_token);
					} else {
						alertService.accountError.tokenNotValid();
					}
				};

                scope.changeLanguage = function(){
                    languageService.update(scope.language);
                }

                scope.changeSigninView = function(_isBack){
                    _isBack = _isBack || false;

                    if(!scope.showSignin && scope.showTokenForm){
                        scope.showTokenForm = false;
                        scope.showSignin = true;
                    }
                    else if(scope.showSignin && !scope.showTokenForm && _isBack){
                        scope.showSignin = false;
                    }
                    else if(scope.showSigninView && !scope.showTokenForm){
                        scope.showTokenForm = true;
                        scope.showSignin = false;
                    }
                    
                    if(!scope.$$phase){
                        scope.$apply();
                    }
                }

                scope.showSigninView = function(){
                    scope.showSignin = true;
                    
                    if(!scope.$$phase){
                        scope.$apply();
                    }
                }
			}
		};
	}]);
