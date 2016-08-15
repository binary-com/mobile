angular
	.module('binary')
	.directive('virtualws', [
		'accountService',
		'languageService',
		'websocketService',
		'alertService',
		'$state',
		'$compile',
		'$ionicLoading',
		'appStateService',

		function(accountService,
			languageService,
			websocketService,
			alertService,
			$state,
			$compile,
			$ionicLoading,
			appStateService) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/accounts/virtualws.template.html',
				scope: {
					message: "="
				},
				link: function(scope, element) {
					scope.data = {};
					websocketService.sendRequestFor.residenceListSend();

					scope.$on('residence_list', function(e, residence_list) {
						if (!appStateService.hasGetResidence) {
							scope.residenceList = residence_list;
							appStateService.hasGetResidence = true;
							scope.data.residence = scope.residenceList[0].text;
						}
					});
					// scope.$watch('residenceList', function() {
  				// 	if (scope.residenceList) {
    			// scope.data.residence = scope.residenceList[0].text;
  				// }
					// });
					scope.createVirtualAccount = function() {

						var verificationCode = scope.data.verificationCode;
						var clientPassword = scope.data.clientPassword;
						var residence = scope.data.residence;
						websocketService.sendRequestFor.newAccountVirtual(verificationCode, clientPassword, residence);
					};
					scope.$on('new_account_virtual', function(e, new_account_virtual){
						if(!appStateService.isLoggedin){
							var _token = new_account_virtual.oauth_token;
							// accountService.validate(token);
							websocketService.authenticate(_token)
						}

					});


				}
			};
		}
	]);
