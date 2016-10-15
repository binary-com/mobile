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
        vm.data = {};
				vm.isReadonly = false;
        vm.data.salutation = "Mr";
        vm.data.forexTradingExperience = "0-1 year";
        vm.data.forexTradingFrequency = "0-5 transactions in the past 12 months";
        vm.data.indicesTradingExperience = "0-1 year";
        vm.data.indicesTradingFrequency = "0-5 transactions in the past 12 months";
        vm.data.commoditiesTradingExperience = "0-1 year";
        vm.data.commoditiesTradingFrequency = "0-5 transactions in the past 12 months";
        vm.data.stocksTradingExperience = "0-1 year";
        vm.data.stocksTradingFrequency = "0-5 transactions in the past 12 months";
        vm.data.otherDerivativesTradingExperience = "0-1 year";
        vm.data.otherDerivativesTradingFrequency = "0-5 transactions in the past 12 months";
        vm.data.otherInstrumentsTradingExperience = "0-1 year";
        vm.data.otherInstrumentsTradingFrequency = "0-5 transactions in the past 12 months";
        vm.data.employmentIndustry = "Construction";
        vm.data.educationLevel = "Primary";
        vm.data.incomeSource = "Salaried Employee";
        vm.data.netIncome = "Less than $25,000";
        vm.data.estimatedWorth = "Less than $100,000";
        vm.data.secretQuestion = "Mother's maiden name";

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

        vm.countryParams = JSON.parse(sessionStorage.countryParams);
        vm.data.countryCode = vm.countryParams.countryCode;
        $scope.$applyAsync(() => {
          vm.data.country = vm.countryParams.countryOfAccount;
        });

				websocketService.sendRequestFor.statesListSend(vm.data.countryCode);
				$scope.$on('states_list', (e, states_list) => {
					vm.data.statesList = states_list;
          vm.data.state = vm.data.statesList[0].value;
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
            if(get_settings.hasOwnProperty('address_line_1')){
              vm.data.addressLine1 = get_settings.address_line_1;
            }
            if(get_settings.hasOwnProperty('address_line_2')){
              vm.data.addressLine2 = get_settings.address_line_2;
            }
            if(get_settings.hasOwnProperty('address_postcode')){
              vm.data.addressPostCode = get_settings.address_postcode;
            }
            if(get_settings.hasOwnProperty('address_state')){
              vm.data.state = get_settings.address_state;
            }
            if(get_settings.hasOwnProperty('phone')){
              vm.data.phone = get_settings.phone;
            }
            if(get_settings.hasOwnProperty('address_city')){
              vm.data.addressCity = get_settings.address_city;
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
							"residence": vm.countryParams.countryCode,
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
