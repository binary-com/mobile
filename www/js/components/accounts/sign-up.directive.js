angular
	.module('binary')
	.directive('signUp', [
		'accountService',
		'languageService',
		'websocketService',
		'alertService',
		'$state',
		'$compile',
		'$ionicLoading', 'appStateService',
		function(accountService,
			languageService,
			websocketService,
			alertService,
			$state,
			$compile,
			$ionicLoading, appStateService) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/accounts/signup.template.html',
				scope: {
					message: "="
				},
				link: function(scope, element) {
					scope.data = {};
					scope.emailError = false;

					scope.verifyUserMail = function() {
						var mail = scope.data.mail;
						websocketService.sendRequestFor.accountOpening(mail);
					}
					scope.$on('verify_email', function(e, verify_email) {
						scope.userMail = verify_email;
						if (scope.userMail == 1) {
							scope.$applyAsync(function(){
								scope.emailError = false;
							});
							scope.$applyAsync(function() {
								scope.$parent.showvirtualws = true;
								scope.showSignup = false;
							});
						}
					});
					scope.$on('verify_email:error', function(e){
						scope.$applyAsync(function(){
							scope.emailError = true;
						});
					});
				}
			};
		}
	]);
