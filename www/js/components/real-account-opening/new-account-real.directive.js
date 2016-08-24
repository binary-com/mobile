angular
	.module('binary')
	.directive('newAccountReal', [
		'accountService',
		'languageService',
		'websocketService',
		'alertService',
		'$state',
		'$compile',
		'$ionicLoading',
		'appStateService',
		'$rootScope',

		function(accountService,
			languageService,
			websocketService,
			alertService,
			$state,
			$compile,
			$ionicLoading,
			appStateService, $rootScope) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/real-account-opening/new-account-real.template.html',
				scope: {
					message: "="
				},
				link: function(scope, element) {


										scope.validateName = (function(val){
											var regex = /[`~!@#$%^&*)(_=+\[}{\]\\\/";:\?><,|\d]+/;
											return {
												test: function(val){
														var reg = regex.test(val);
														if(reg == true){
															return false;
														}
														else{
															return true;
														}
												}
											}
										})();


					scope.data = {};
					scope.data.countryCode = $rootScope.countryCodeOfAccount;
					scope.data.country = $rootScope.countryOfAccount;
					websocketService.sendRequestFor.statesListSend($rootScope.countryCodeOfAccount);
					scope.$on('states_list', function(e, states_list) {
						scope.statesList = states_list;
					});

					scope.submitAccountOpening = function() {
						if(scope.data.dateOfBirth){
							var birth = scope.data.dateOfBirth.toISOString().slice(0,10);
						}
						if (_.isEmpty(scope.data.state)) {
							scope.data.state = "";
						}
						if (_.isEmpty(scope.data.addressLine2)) {
							scope.data.addressLine2 = "";
						}
						if (_.isEmpty(scope.data.addressPostcode)) {
							scope.data.addressPostcode = "";
						}
						websocketService.sendRequestFor.createRealAccountSend(scope.data.salutation, scope.data.firstName, scope.data.lastName, birth, scope.data.countryCode, scope.data.addressLine1, scope.data.addressLine2, scope.data.addressCity, scope.data.state, scope.data.addressPostcode, scope.data.phone, scope.data.secretQuestion, scope.data.secretAnswer);
					};

				}
			}
		}
	]);
