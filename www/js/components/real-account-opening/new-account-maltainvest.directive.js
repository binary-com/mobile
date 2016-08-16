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

		function(accountService,
			languageService,
			websocketService,
			alertService,
			$state,
			$compile,
			$ionicLoading,
			appStateService,
			$rootScope) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/real-account-opening/new-account-maltainvest.template.html',
				scope: {
					message: "="
				},
				link: function(scope, element) {

					scope.isFirstSection = true;
					scope.isSecondSection = false;
					scope.isThirdSection = false;
					scope.isFifthSection = false;
					scope.isForthSection = false;
					scope.hasMoreStages = true;
					scope.hasLessStages = false;
					scope.$applyAsync(function(){
						if(appStateService.hasMLT){
							scope.isReadonly = true;
						}
					});

					// handle the 'next' button
					scope.goToNextSection = function() {
						scope.$applyAsync(function() {
							if (scope.isFirstSection == true && scope.isSecondSection == false && scope.isThirdSection == false && scope.isForthSection == false && scope.isFifthSection == false) {
								scope.isFirstSection = false;
								scope.isSecondSection = true;
								scope.isThirdSection = false;
								scope.hasLessStages = true;
							} else if (scope.isFirstSection == false && scope.isSecondSection == true && scope.isThirdSection == false && scope.isForthSection == false && scope.isFifthSection == false) {
								scope.isSecondSection = false;
								scope.isThirdSection = true;
								scope.hasLessStages = true;
							} else if (scope.isFirstSection == false && scope.isSecondSection == false && scope.isThirdSection == true && scope.isForthSection == false && scope.isFifthSection == false) {
								scope.isThirdSection = false;
								scope.isForthSection = true;
								scope.hasLessStages = true;
							} else if (scope.isFirstSection == false && scope.isSecondSection == false && scope.isThirdSection == false && scope.isForthSection == true && scope.isFifthSection == false) {
								scope.isForthSection = false;
								scope.isFifthSection = true;
								scope.hasMoreStages = false;
								scope.hasLessStages = true;
							}
						});
					}

						scope.goToLastSection = function(){
							scope.$applyAsync(function() {
							if (scope.isFirstSection == false && scope.isSecondSection == true && scope.isThirdSection == false && scope.isForthSection == false && scope.isFifthSection == false) {
									scope.isSecondSection = false;
									scope.isFirstSection = true;
									scope.hasLessStages = false;
									scope.hasMoreStages = true;
								} else if (scope.isFirstSection == false && scope.isSecondSection == false && scope.isThirdSection == true && scope.isForthSection == false && scope.isFifthSection == false) {
									scope.isThirdSection = false;
									scope.isSecondSection = true;
									scope.hasLessStages = true;
									scope.hasMoreStages = true;
								} else if (scope.isFirstSection == false && scope.isSecondSection == false && scope.isThirdSection == false && scope.isForthSection == true && scope.isFifthSection == false) {
									scope.isForthSection = false;
									scope.isThirdSection = true;
									scope.hasLessStages = true;
									scope.hasMoreStages = true;
								} else if (scope.isFirstSection == false && scope.isSecondSection == false && scope.isThirdSection == false && scope.isForthSection == false && scope.isFifthSection == true) {
									scope.isFifthSection = false;
									scope.isForthSection = true;
									scope.hasLessStages = true;
									scope.hasMoreStages = true;
								}
							});
						}



					scope.data = {};
					scope.data.countryCode = $rootScope.countryCodeOfAccount;
					scope.data.country = $rootScope.countryOfAccount;
					websocketService.sendRequestFor.statesListSend($rootScope.countryCodeOfAccount);
					scope.$on('states_list', function(e, states_list) {
						scope.statesList = states_list;
					});
					websocketService.sendRequestFor.accountSetting();
					scope.$on('get_settings', function(e, get_settings) {
						var birth = new Date(get_settings.date_of_birth);
						scope.$applyAsync(function() {
							scope.data.dateOfBirth = birth.toISOString().slice(0, 10);
							scope.data.firstName = get_settings.first_name;
							scope.data.lastName = get_settings.last_name;
							scope.data.salutation = get_settings.salutation;
						});
					});

					scope.submitAccountOpening = function() {
						if (scope.data.accept == true) {
							scope.data.acceptRisk = 1
						} else {
							scope.data.acceptRisk = 0
						}
						websocketService.sendRequestFor.createMaltainvestAccountSend(scope.data.salutation, scope.data.firstName, scope.data.lastName, scope.data.dateOfBirth, scope.data.countryCode, scope.data.addressLine1, scope.data.addressLine2, scope.data.addressCity, scope.data.state, scope.data.addressPostcode, scope.data.phone, scope.data.secretQuestion, scope.data.secretAnswer, scope.data.forexTradingExperience, scope.data.forexTradingFrequency, scope.data.indicesTradingExperience, scope.data.indicesTradingFrequency, scope.data.commoditiesTradingExperience, scope.data.commoditiesTradingFrequency, scope.data.stocksTradingExperience, scope.data.stocksTradingFrequency, scope.data.otherDrivativesTradingExperience, scope.data.otherDrivativesTradingFrequency, scope.data.otherInstrumentsTradingExperience, scope.data.otherInstrumentsTradingFrequency, scope.data.employmentIndustry, scope.data.educationLevel, scope.data.incomeSource, scope.data.netIncome, scope.data.estimatedWorth, scope.data.acceptRisk);
					};

				}
			}
		}
	]);
