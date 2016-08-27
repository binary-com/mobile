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
						var params = {
							"salutation": scope.data.salutation,
							"first_name": scope.data.firstName,
							"last_name": scope.data.lastName,
							"date_of_birth": birth,
							"residence": scope.data.countryCode,
							"address_line_1": scope.data.addressLine1,
							"address_line_2": scope.data.addressLine2,
							"address_city": scope.data.addressCity,
							"address_state": scope.data.state,
							"address_postcode": scope.data.addressPostcode,
							"phone": scope.data.phone,
							"secret_question": scope.data.secretQuestion,
							"secret_answer": scope.data.secretAnswer
						}
						websocketService.sendRequestFor.createRealAccountSend(params);
					};

				}
			}
		}
	]);
