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
        .module('binary.pages.real-account-opening')
        .controller('RealAccountOpeningController', RealAccountOpening);

    RealAccountOpening.$inject = ['$scope', '$filter', '$ionicModal', 'websocketService', 'appStateService', 'accountService', 'alertService'];

    function RealAccountOpening($scope, $filter, $ionicModal, websocketService, appStateService, accountService, alertService) {
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
            "address_line_1",
            "address_line_2",
            "address_city",
            "address_state",
            "address_postcode",
            "phone",
            "secret_question",
            "secret_answer"
        ];

        // set all fields errors to false
        vm.resetAllErrors = function() {
            _.forEach(vm.formData, (value, key) => {
                var errorName = _.camelCase(value) + 'Error';
                vm[errorName] = false;
            });
        }
        vm.resetAllErrors();

        websocketService.sendRequestFor.residenceListSend();
        $scope.$on('residence_list', (e, residence_list) => {
            vm.residenceList = residence_list;
            vm.getUserCountry();
        });

        vm.getUserCountry = function() {
            // check if there are country and country code of user in sessionStorage
            // some users from past don't have country chosen in signup
            if (sessionStorage.hasOwnProperty('countryParams')) {
                vm.countryParams = JSON.parse(sessionStorage.countryParams);
                vm.data.residence = vm.countryParams.countryCode;
                vm.hasResidence = true;
            }
        }

        vm.findPhoneCode = function(country) {
            return country.value == vm.data.residence;
        }

        $scope.$watch('vm.data.residence', () => {
          if(vm.data.residence){
            vm.indexOfResidence = vm.residenceList[_.findIndex(vm.residenceList, (val) => {
              return val.value === vm.data.residence;
            })];
            if(vm.indexOfResidence.phone_idd) {
              vm.phoneCode = vm.indexOfResidence.phone_idd;
              vm.data.phone = '+' + vm.phoneCode;
            }
            websocketService.sendRequestFor.statesListSend(vm.data.residence);
          }
        });

        $scope.$on('states_list', (e, states_list) => {
            vm.statesList = states_list;
        });

        // regexp pattern for name input (pattern in perl API doesn't work in javascript)
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
            vm.params = {};
            _.forEach(vm.data, (value, key) => {
                vm.dataName = _.snakeCase(key);
                if (vm.requestData.indexOf(vm.dataName) > -1) {
                    if (vm.dataName !== 'date_of_birth') {
                        vm.params[vm.dataName] = value;
                    } else {
                        vm.params[vm.dataName] = $filter('date')(value, 'yyyy-MM-dd');
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
                            var errorName = _.camelCase(value) + 'Error';
                            var errorMessageName = _.camelCase(value) + 'ErrorMessage';
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
