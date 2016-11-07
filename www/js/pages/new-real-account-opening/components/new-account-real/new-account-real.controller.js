/**
 * @name new-account-real controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.new-real-account-opening.components.new-account-real')
        .controller('NewAccountRealController', NewAccountReal);

    NewAccountReal.$inject = ['$scope', '$state' , '$rootScope', 'websocketService', 'appStateService', 'accountService', 'alertService'];

    function NewAccountReal($scope, $state, $rootScope, websocketService,  appStateService, accountService, alertService) {
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

        vm.data.salutation = "Mr";
        vm.data.secretQuestion = "Mother's maiden name";
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

        vm.findPhoneCode = function(country){
          return country.value == vm.data.countryCode;
        }
        websocketService.sendRequestFor.residenceListSend();
        $scope.$on('residence_list', (e, residence_list) => {
            vm.residenceList = residence_list;
            vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
            if(vm.phoneCodeObj.hasOwnProperty('phone_idd')){
              vm.data.phone = '+' + vm.phoneCodeObj.phone_idd;
            }
        });



        vm.validateName = (function(val) {
            var regex = /[`~!@#$%^&*)(_=+\[}{\]\\\/";:\?><,|\d]+/;
            return {
                test: function(val) {
                    var reg = regex.test(val);
                    if (reg == true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        })();


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
            if (vm.data.dateOfBirth) {
                var birth = vm.data.dateOfBirth.toISOString().slice(0, 10);
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
            var params = {
                "salutation": vm.data.salutation,
                "first_name": vm.data.firstName,
                "last_name": vm.data.lastName,
                "date_of_birth": birth,
                "residence": vm.data.countryCode,
                "address_line_1": vm.data.addressLine1,
                "address_line_2": vm.data.addressLine2,
                "address_city": vm.data.addressCity,
                "address_state": vm.data.state,
                "address_postcode": vm.data.addressPostcode,
                "phone": vm.data.phone,
                "secret_question": vm.data.secretQuestion,
                "secret_answer": vm.data.secretAnswer
            }
            websocketService.sendRequestFor.createRealAccountSend(params);
        };

        // error handling by backend errors under each input
        $scope.$on('new_account_real:error', (e, error) => {
          if(error.hasOwnProperty('details')){
            $scope.$applyAsync(() => {
            if(error.details.hasOwnProperty('salutation')){
              vm.salutationError = true;
              vm.salutationErrorMessage = error.details.salutation;
            }
            if(error.details.hasOwnProperty('first_name')){
              vm.firstNameError = true;
              vm.firstNameErrorMessage = error.details.first_name;
            }
            if(error.details.hasOwnProperty('last_name')){
              vm.lastNameError = true;
              vm.lastNameErrorMessage = error.details.last_name;
            }
            if(error.details.hasOwnProperty('date_of_birth')){
              vm.dateOfBirthError = true;
              vm.dateOfBirthErrorMessage = error.details.date_of_birth;
            }
            if(error.details.hasOwnProperty('residence')){
              vm.countryError = true;
              vm.countryErrorMessage = error.details.residence;
            }
            if(error.details.hasOwnProperty('address_line_1')){
              vm.addressLine1Error = true;
              vm.addressLine1ErrorMessage = error.details.address_line_1;
            }
            if(error.details.hasOwnProperty('address_line_2')){
              vm.addressLine2Error = true;
              vm.addressLine2ErrorMessage = error.details.address_line_2;
            }
            if(error.details.hasOwnProperty('address_city')){
              vm.addressCityError = true;
              vm.addressCityErrorMessage = error.details.address_city;
            }
            if(error.details.hasOwnProperty('address_state')){
              vm.addressStateError = true;
              vm.addressStateErrorMessage = error.details.address_state;
            }
            if(error.details.hasOwnProperty('address_postcode')){
              vm.addressPostcodeError = true;
              vm.addressPostcodeErrorMessage = error.details.address_postcode;
            }
            if(error.details.hasOwnProperty('phone')){
              vm.phoneError = true;
              vm.phoneErrorMessage = error.details.phone;
            }
            if(error.details.hasOwnProperty('secret_question')){
              vm.secretQuestionError = true;
              vm.secretQuestionErrorMessage = error.details.secret_question;
            }
            if(error.details.hasOwnProperty('secret_answer')){
              vm.secretAnswerError = true;
              vm.secretAnswerErrorMessage = error.details.secret_answer;
            }
          });

            }
          if(error.code){
            alertService.displayError(error.message);
          }
        });

        $scope.$on('new_account_real', (e, new_account_real) => {
            websocketService.authenticate(new_account_real.oauth_token);
            vm.selectedAccount = new_account_real.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount =  vm.selectedAccount;
        });



    }
})();
