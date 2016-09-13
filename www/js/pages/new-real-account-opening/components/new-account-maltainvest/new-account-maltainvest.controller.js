/**
 * @name new-account-maltainvest controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.new-real-account-opening.components.new-account-maltainvest')
        .controller('NewAccountMaltainvestController', NewAccountMaltainvest);

    NewAccountMaltainvest.$inject = ['$scope', '$timeout',  '$translate', '$location', '$state', '$ionicPopup', 'websocketService', 'appStateService', 'accountService', 'alertService', 'languageService'];

    function NewAccountMaltainvest($scope, $timeout,  $translate, $location, $state, $ionicPopup, websocketService, appStateService, accountService, alertService, languageService) {
        var vm = this;
				vm.isReadonly = false;
				vm.steps = [
					'details',
					'financial_information',
					'privacy'
				];
				vm.selection = vm.steps[0];

				vm.getCurrentStepIndex = function() {
					// Get the index of the current step given selection
					return _.indexOf(vm.steps, vm.selection);
				};

				// Go to a defined step index
				vm.goToStep = function(index) {
					vm.current = vm.getCurrentStepIndex();
					if (!_.isUndefined(vm.steps[index])) {
						if (index == vm.current + 1) {
							if (vm.current == 0 && !detailsForm.$error) {
								vm.selection = vm.steps[index];
							}
							if (vm.current == 1 && !financialForm.$error) {
								vm.selection = vm.steps[index];
							}
						}
						if(index < vm.current){
							vm.selection = vm.steps[index];
						}
					}
				};

				vm.hasNextStep = function() {
					var stepIndex = vm.getCurrentStepIndex();
					var nextStep = stepIndex + 1;
					// Return true if there is a next step, false if not
					return !_.isUndefined(vm.steps[nextStep]);
				};

				vm.hasPreviousStep = function() {
					var stepIndex = vm.getCurrentStepIndex();
					var previousStep = stepIndex - 1;
					// Return true if there is a next step, false if not
					return !_.isUndefined(vm.steps[previousStep]);
				};

				vm.incrementStep = function() {
					if (vm.hasNextStep()) {
						var stepIndex = vm.getCurrentStepIndex();
						var nextStep = stepIndex + 1;
						vm.selection = vm.steps[nextStep];

					}
				};

				vm.decrementStep = function() {
					if (vm.hasPreviousStep()) {
						var stepIndex = vm.getCurrentStepIndex();
						var previousStep = stepIndex - 1;
						vm.selection = vm.steps[previousStep];
					}
				};

				$scope.$applyAsync( () => {
					if (appStateService.hasMLT) {
						vm.isReadonly = true;
					}
				});



				vm.validateName = (function(val) {
					var regex = /[`~!@#$%^&*)(_=+\[}{\]\\\/";:\?><,|\d]+/;
					return {
						test: function(val) {
							if (!vm.isReadonly) {
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

				vm.data = {};
        $scope.$on('countryCodeOfAccount', (e, countryCodeOfAccount) => {
          vm.data.countryCode = countryCodeOfAccount;
        });
        $scope.$on('countryOfAccount', (e, countryOfAccount) => {
          vm.data.country = countryOfAccount;
        });
				// vm.data.countryCode = $rootScope.countryCodeOfAccount;
				// vm.data.country = $rootScope.countryOfAccount;

				websocketService.sendRequestFor.statesListSend(vm.data.countryCode);
				$scope.$on('states_list', (e, states_list) => {
					vm.data.statesList = states_list;
				});
				websocketService.sendRequestFor.accountSetting();
				$scope.$on('get_settings', (e, get_settings) => {
					$scope.$applyAsync(() => {
						if (appStateService.hasMLT) {
							var birth = new Date(get_settings.date_of_birth);
							vm.data.dateOfBirth = birth.toISOString().slice(0, 10);
							vm.data.firstName = get_settings.first_name;
							vm.data.lastName = get_settings.last_name;
							vm.data.salutation = get_settings.salutation;
						}


					});
				});

				vm.submitAccountOpening = function() {
					if (vm.data.accept == true) {
						vm.data.acceptRisk = 1
					} else {
						vm.data.acceptRisk = 0
					}
					if (_.isEmpty(vm.data.state)) {
						vm.data.state = "";
					}
					if (_.isEmpty(vm.data.addressLine2)) {
						vm.data.addressLine2 = "";
					}
					if (_.isEmpty(vm.data.addressPostcode)) {
						vm.data.addressPostcode = "";
					}
					if(!appStateService.hasMLT){
						vm.data.birthDate = vm.data.userDateOfBirth.toISOString().slice(0, 10);
					}
					if(appStateService.hasMLT){
						vm.data.birthDate = vm.data.dateOfBirth;
					}
					var params = {
							"salutation": vm.data.salutation,
							"first_name": vm.data.firstName,
							"last_name": vm.data.lastName,
							"date_of_birth": vm.data.birthDate,
							"residence": vm.data.countryCode,
							"address_line_1": vm.data.addressLine1,
							"address_line_2": vm.data.addressLine2,
							"address_city": vm.data.addressCity,
							"address_state": vm.data.state,
							"address_postcode": vm.data.addressPostcode,
							"phone": vm.data.phone,
							"secret_question": vm.data.secretQuestion,
							"secret_answer": vm.data.secretAnswer,
							"forex_trading_experience": vm.data.forexTradingExperience,
							"forex_trading_frequency": vm.data.forexTradingFrequency,
							"indices_trading_experience": vm.data.indicesTradingExperience,
							"indices_trading_frequency": vm.data.indicesTradingFrequency,
							"commodities_trading_experience": vm.data.commoditiesTradingExperience,
							"commodities_trading_frequency": vm.data.commoditiesTradingFrequency,
							"stocks_trading_experience": vm.data.stocksTradingExperience,
							"stocks_trading_frequency": vm.data.stocksTradingFrequency,
							"other_derivatives_trading_experience": vm.data.otherDerivativesTradingExperience,
							"other_derivatives_trading_frequency": vm.data.otherDerivativesTradingFrequency,
							"other_instruments_trading_experience": vm.data.otherInstrumentsTradingExperience,
							"other_instruments_trading_frequency": vm.data.otherInstrumentsTradingFrequency,
							"employment_industry": vm.data.employmentIndustry,
							"education_level": vm.data.educationLevel,
							"income_source": vm.data.incomeSource,
							"net_income": vm.data.netIncome,
							"estimated_worth": vm.data.estimatedWorth,
							"accept_risk": vm.data.acceptRisk
						};
					websocketService.sendRequestFor.createMaltainvestAccountSend(params);
				};




			}})();
