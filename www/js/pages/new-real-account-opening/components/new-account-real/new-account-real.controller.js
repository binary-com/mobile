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

    NewAccountReal.$inject = ['$scope', '$state', '$rootScope', 'websocketService', 'appStateService', 'accountService', 'alertService'];

    function NewAccountReal($scope, $state, $rootScope, websocketService, appStateService, accountService, alertService) {
        var vm = this;
        vm.data = {};
        vm.hasResidence = false;
        vm.formData = [
            'salutation',
            'first_name',
            'last_name',
            'date_of_birth',
            'residence',
            'address_line_1',
            'address_line_2',
            'address_city',
            'address_state',
            'address_postcode',
            'phone',
            'secret_question',
            'secret_answer'
        ];

        vm.requestData = [
            "salutation",
            "first_name",
            "last_name",
            "date_of_birth",
            "residence",
            "place_of_birth",
            "address_line_1",
            "address_line_2",
            "address_city",
            "address_state",
            "address_postcode",
            "phone",
            "secret_question",
            "secret_answer"
        ];


        vm.setCountry = function() {
            if (sessionStorage.hasOwnProperty('countryParams')) {
                vm.countryParams = JSON.parse(sessionStorage.countryParams);
                vm.data.countryCode = vm.countryParams.countryCode;
                vm.data.residence = vm.countryParams.countryCode;
                vm.hasResidence = true;
            }
        }

        vm.setCountry();

        vm.firstToLowerCase = function(str) {
            return str.substr(0, 1).toLowerCase() + str.substr(1);
        }
        vm.convertDataName = function(key) {
            var str = key.replace(/_|-|\\. /g, ' ');
            var dataName = str.replace(/\w\S*/g, function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }).replace(/\s/g, '');
            return vm.firstToLowerCase(dataName);
        }

        vm.resetAllErrors = function() {
            _.forEach(vm.formData, (value, key) => {
                var errorName = vm.convertDataName(value) + 'Error';
                vm[errorName] = false;
            });
        }

        vm.resetAllErrors();




        websocketService.sendRequestFor.statesListSend(vm.data.countryCode);
        $scope.$on('states_list', (e, states_list) => {
            vm.data.statesList = states_list;
        });

        vm.findPhoneCode = function(country) {
            return country.value == vm.data.countryCode;
        }
        websocketService.sendRequestFor.residenceListSend();
        $scope.$on('residence_list', (e, residence_list) => {
            vm.residenceList = residence_list;
            vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
            if (vm.phoneCodeObj.hasOwnProperty('phone_idd')) {
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
            vm.resetAllErrors();
            if (vm.data.dateOfBirth) {
                var birth = vm.data.dateOfBirth.toISOString().slice(0, 10);
            }
            vm.params = {};
            _.forEach(vm.data, (value, key) => {
                var dataName = _.snakeCase(key);
                if (vm.requestData.indexOf(dataName) > -1) {
                    if (dataName !== 'date_of_birth') {
                        vm.params[dataName] = value;
                    } else {
                        vm.data.birthDate = vm.data.dateOfBirth.toISOString().slice(0, 10);
                        vm.params.date_of_birth = vm.data.birthDate;
                    }
                }
            });
            websocketService.sendRequestFor.createRealAccountSend(vm.params);
        };

        // error handling by backend errors under each input
        $scope.$on('new_account_real:error', (e, error) => {
            if (error.hasOwnProperty('details')) {
                $scope.$applyAsync(() => {
                    _.forEach(vm.requestData, (value, key) => {
                        if (error.details.hasOwnProperty(value)) {
                            var errorName = vm.convertDataName(value) + 'Error';
                            var errorMessageName = vm.convertDataName(value) + 'ErrorMessage';
                            vm[errorName] = true;
                            vm[errorMessageName] = error.details[value];
                        }
                    });
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on('new_account_real', (e, new_account_real) => {
            websocketService.authenticate(new_account_real.oauth_token);
            vm.selectedAccount = new_account_real.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount = vm.selectedAccount;
        });



    }
})();
