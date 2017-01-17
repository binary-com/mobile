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

    NewAccountMaltainvest.$inject = ['$scope', '$state', '$rootScope', 'websocketService', 'appStateService', 'accountService', 'alertService'];

    function NewAccountMaltainvest($scope, $state, $rootScope, websocketService, appStateService, accountService, alertService) {
        var vm = this;
        vm.data = {};
        vm.salutationError = false;
        vm.firstNameError = false;
        vm.lastNameError = false;
        vm.dateOfBirthError = false;
        vm.countryError = false;
        vm.addressLine1Error = false;
        vm.addressLine2Error = false;
        vm.addressCityError = false;
        vm.addressStateError = false;
        vm.addressPostcodeError = false;
        vm.phoneError = false;
        vm.secretQuestionError = false;
        vm.secretAnswerError = false;
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

        websocketService.sendRequestFor.residenceListSend();
        $scope.$on('residence_list', (e, residence_list) => {
            vm.residenceList = residence_list;
        });

        $scope.$applyAsync(() => {
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
        vm.findPhoneCode = function(country){
          return country.value == vm.data.countryCode;
        }

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
                if (get_settings.hasOwnProperty('address_line_1')) {
                    vm.data.addressLine1 = get_settings.address_line_1;
                }
                if (get_settings.hasOwnProperty('address_line_2')) {
                    vm.data.addressLine2 = get_settings.address_line_2;
                }
                if (get_settings.hasOwnProperty('address_postcode')) {
                    vm.data.addressPostCode = get_settings.address_postcode;
                }
                if (get_settings.hasOwnProperty('address_state')) {
                    vm.data.state = get_settings.address_state;
                }
                if (get_settings.hasOwnProperty('phone')) {
                    vm.data.phone = get_settings.phone;
                }
                if (!get_settings.hasOwnProperty('phone')) {
                  vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
                  vm.data.phone = '+' + vm.phoneCodeObj.phone_idd;
                }
                if (get_settings.hasOwnProperty('address_city')) {
                    vm.data.addressCity = get_settings.address_city;
                }
            });
        });

        vm.submitAccountOpening = function() {
            vm.salutationError = false;
            vm.firstNameError = false;
            vm.lastNameError = false;
            vm.dateOfBirthError = false;
            vm.countryError = false;
            vm.addressLine1Error = false;
            vm.addressLine2Error = false;
            vm.addressCityError = false;
            vm.addressStateError = false;
            vm.addressPostcodeError = false;
            vm.phoneError = false;
            vm.secretQuestionError = false;
            vm.secretAnswerError = false;
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
            if (!appStateService.hasMLT) {
                vm.data.birthDate = vm.data.userDateOfBirth.toISOString().slice(0, 10);
            }
            if (appStateService.hasMLT) {
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


        $scope.$on('new_account_maltainvest:error', (e, error) => {
          if(error.hasOwnProperty('details')){
            $scope.$applyAsync(() => {

                if (error.details.hasOwnProperty('salutation')) {
                    vm.salutationError = true;
                    vm.salutationErrorMessage = error.details.salutation;
                }
                if (error.details.hasOwnProperty('first_name')) {
                    vm.firstNameError = true;
                    vm.firstNameErrorMessage = error.details.first_name;
                }
                if (error.details.hasOwnProperty('last_name')) {
                    vm.lastNameError = true;
                    vm.lastNameErrorMessage = error.details.last_name;
                }
                if (error.details.hasOwnProperty('date_of_birth')) {
                    vm.dateOfBirthError = true;
                    vm.dateOfBirthErrorMessage = error.details.date_of_birth;
                }
                if (error.details.hasOwnProperty('residence')) {
                    vm.countryError = true;
                    vm.countryErrorMessage = error.details.residence;
                }
                if (error.details.hasOwnProperty('address_line_1')) {
                    vm.addressLine1Error = true;
                    vm.addressLine1ErrorMessage = error.details.address_line_1;
                }
                if (error.details.hasOwnProperty('address_line_2')) {
                    vm.addressLine2Error = true;
                    vm.addressLine2ErrorMessage = error.details.address_line_2;
                }
                if (error.details.hasOwnProperty('address_city')) {
                    vm.addressCityError = true;
                    vm.addressCityErrorMessage = error.details.address_city;
                }
                if (error.details.hasOwnProperty('address_state')) {
                    vm.addressStateError = true;
                    vm.addressStateErrorMessage = error.details.address_state;
                }
                if (error.details.hasOwnProperty('address_postcode')) {
                    vm.addressPostcodeError = true;
                    vm.addressPostcodeErrorMessage = error.details.address_postcode;
                }
                if (error.details.hasOwnProperty('phone')) {
                    vm.phoneError = true;
                    vm.phoneErrorMessage = error.details.phone;
                }
                if (error.details.hasOwnProperty('secret_question')) {
                    vm.secretQuestionError = true;
                    vm.secretQuestionErrorMessage = error.details.secret_question;
                }
                if (error.details.hasOwnProperty('secret_answer')) {
                    vm.secretAnswerError = true;
                    vm.secretAnswerErrorMessage = error.details.secret_answer;
                }
              });
                }
          if(error.code){
            alertService.displayError(error.message);
          }
        });

        $scope.$on('new_account_maltainvest', (e, new_account_maltainvest) => {
            websocketService.authenticate(new_account_maltainvest.oauth_token);
            vm.selectedAccount = new_account_maltainvest.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount =  vm.selectedAccount;
        });

    }
})();
