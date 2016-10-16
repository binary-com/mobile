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

    NewAccountReal.$inject = ['$scope', '$state', 'websocketService'];

    function NewAccountReal($scope, $state, websocketService) {
        var vm = this;
        vm.data = {};
        vm.firstNameError = false;
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
        $scope.$on('new_account_real:error', (e, details) => {
          $scope.$applyAsync(() => {
            if(details.hasOwnProperty('salutation')){
              vm.salutationError = true;
              vm.salutationErrorMessage = details.salutation;
            }
            if(details.hasOwnProperty('first_name')){
              vm.firstNameError = true;
              vm.firstNameErrorMessage = details.first_name;
            }
            if(details.hasOwnProperty('last_name')){
              vm.lastNameError = true;
              vm.lastNameErrorMessage = details.last_name;
            }
            if(details.hasOwnProperty('date_of_birth')){
              vm.dateOfBirthError = true;
              vm.dateOfBirthErrorMessage = details.date_of_birth;
            }
            if(details.hasOwnProperty('residence')){
              vm.countryError = true;
              vm.countryErrorMessage = details.residence;
            }
            if(details.hasOwnProperty('address_line_1')){
              vm.addressLine1Error = true;
              vm.addressLine1ErrorMessage = details.address_line_1;
            }
            if(details.hasOwnProperty('address_line_2')){
              vm.addressLine2Error = true;
              vm.addressLine2ErrorMessage = details.address_line_2;
            }
            if(details.hasOwnProperty('address_city')){
              vm.addressCityError = true;
              vm.addressCityErrorMessage = details.address_city;
            }
            if(details.hasOwnProperty('address_state')){
              vm.addressStateError = true;
              vm.addressStateErrorMessage = details.address_state;
            }
            if(details.hasOwnProperty('address_postcode')){
              vm.addressPostcodeError = true;
              vm.addressPostcodeErrorMessage = details.address_postcode;
            }
            if(details.hasOwnProperty('phone')){
              vm.phoneError = true;
              vm.phoneErrorMessage = details.phone;
            }
            if(details.hasOwnProperty('secret_question')){
              vm.secretQuestionError = true;
              vm.secretQuestionErrorMessage = details.secret_question;
            }
            if(details.hasOwnProperty('secret_answer')){
              vm.secretAnswerError = true;
              vm.secretAnswerErrorMessage = details.secret_answer;
            }

          });

        });

    }
})();
