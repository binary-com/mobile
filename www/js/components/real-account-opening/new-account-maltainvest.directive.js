angular
	.module('binary')
	.directive('newAccountMaltainvest', [
		'accountService',
		'languageService',
		'websocketService',
		'alertService',
		'$state',
		'$compile',
		'$ionicLoading',
		'appStateService',
		'$rootScope',
		'$location',

		function(accountService,
			languageService,
			websocketService,
			alertService,
			$state,
			$compile,
			$ionicLoading,
			appStateService,
			$rootScope,
			$location) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/real-account-opening/new-account-maltainvest.template.html',
				scope: {
					message: "="
				},
				link: function(scope, $location, element, ctrl) {
					scope.isReadonly = false;
					scope.steps = [
						'details',
						'financial_information',
						'privacy'
					];
					scope.selection = scope.steps[0];

					scope.getCurrentStepIndex = function() {
						// Get the index of the current step given selection
						return _.indexOf(scope.steps, scope.selection);
					};

					// Go to a defined step index
					scope.goToStep = function(index) {
						scope.current = scope.getCurrentStepIndex();
						if (!_.isUndefined(scope.steps[index])) {
							if (index == scope.current + 1) {
								if (scope.current == 0 && !detailsForm.$error) {
									scope.selection = scope.steps[index];
								}
								if (scope.current == 1 && !financialForm.$error) {
									scope.selection = scope.steps[index];
								}
							}
							if(index < scope.current){
								scope.selection = scope.steps[index];
							}
						}
					};

					scope.hasNextStep = function() {
						var stepIndex = scope.getCurrentStepIndex();
						var nextStep = stepIndex + 1;
						// Return true if there is a next step, false if not
						return !_.isUndefined(scope.steps[nextStep]);
					};

					scope.hasPreviousStep = function() {
						var stepIndex = scope.getCurrentStepIndex();
						var previousStep = stepIndex - 1;
						// Return true if there is a next step, false if not
						return !_.isUndefined(scope.steps[previousStep]);
					};

					scope.incrementStep = function() {
						if (scope.hasNextStep()) {
							var stepIndex = scope.getCurrentStepIndex();
							var nextStep = stepIndex + 1;
							scope.selection = scope.steps[nextStep];

						}
					};

					scope.decrementStep = function() {
						if (scope.hasPreviousStep()) {
							var stepIndex = scope.getCurrentStepIndex();
							var previousStep = stepIndex - 1;
							scope.selection = scope.steps[previousStep];
						}
					};

					scope.$applyAsync(function() {
						if (appStateService.hasMLT) {
							scope.isReadonly = true;
						}
					});



					scope.validateName = (function(val) {
						var regex = /[`~!@#$%^&*)(_=+\[}{\]\\\/";:\?><,|\d]+/;
						return {
							test: function(val) {
								if (!scope.isReadonly) {
									var reg = regex.test(val);

									if (reg == true) {
										return false;
									} else {
										return true;
									}
								} else {
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
					websocketService.sendRequestFor.accountSetting();
					scope.$on('get_settings', function(e, get_settings) {
						scope.$applyAsync(function() {
							if (appStateService.hasMLT) {
								var birth = new Date(get_settings.date_of_birth);
								scope.data.dateOfBirth = birth.toISOString().slice(0, 10);
								scope.data.firstName = get_settings.first_name;
								scope.data.lastName = get_settings.last_name;
								scope.data.salutation = get_settings.salutation;
							}


						});
					});

					scope.submitAccountOpening = function() {
						if (scope.data.accept == true) {
							scope.data.acceptRisk = 1
						} else {
							scope.data.acceptRisk = 0
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
						if(!appStateService.hasMLT){
							scope.data.birthDate = scope.data.userDateOfBirth.toISOString().slice(0, 10);
						}
						if(appStateService.hasMLT){
							scope.data.birthDate = scope.data.dateOfBirth;
						}
						var params = {
								"salutation": scope.data.salutation,
								"first_name": scope.data.firstName,
								"last_name": scope.data.lastName,
								"date_of_birth": scope.data.birthDate,
								"residence": scope.data.countryCode,
								"address_line_1": scope.data.addressLine1,
								"address_line_2": scope.data.addressLine2,
								"address_city": scope.data.addressCity,
								"address_state": scope.data.state,
								"address_postcode": scope.data.addressPostcode,
								"phone": scope.data.phone,
								"secret_question": scope.data.secretQuestion,
								"secret_answer": scope.data.secretAnswer,
								"forex_trading_experience": scope.data.forexTradingExperience,
								"forex_trading_frequency": scope.data.forexTradingFrequency,
								"indices_trading_experience": scope.data.indicesTradingExperience,
								"indices_trading_frequency": scope.data.indicesTradingFrequency,
								"commodities_trading_experience": scope.data.commoditiesTradingExperience,
								"commodities_trading_frequency": scope.data.commoditiesTradingFrequency,
								"stocks_trading_experience": scope.data.stocksTradingExperience,
								"stocks_trading_frequency": scope.data.stocksTradingFrequency,
								"other_derivatives_trading_experience": scope.data.otherDerivativesTradingExperience,
								"other_derivatives_trading_frequency": scope.data.otherDerivativesTradingFrequency,
								"other_instruments_trading_experience": scope.data.otherInstrumentsTradingExperience,
								"other_instruments_trading_frequency": scope.data.otherInstrumentsTradingFrequency,
								"employment_industry": scope.data.employmentIndustry,
								"education_level": scope.data.educationLevel,
								"income_source": scope.data.incomeSource,
								"net_income": scope.data.netIncome,
								"estimated_worth": scope.data.estimatedWorth,
								"accept_risk": scope.data.acceptRisk
							};
						websocketService.sendRequestFor.createMaltainvestAccountSend(params);
					};

				}
			}
		}
	]);
