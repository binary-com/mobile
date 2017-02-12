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
        vm.formData = [
          'salutation',
          'first_name',
          'last_name',
          'date_of_birth',
          'country',
          'address_line_1',
          'address_line_2',
          'address_city',
          'address_state',
          'address_postcode',
          'phone',
          'secret_question',
          'secret_answer',
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
          "secret_answer",
          "forex_trading_experience",
          "forex_trading_frequency",
          "indices_trading_experience",
          "indices_trading_frequency",
          "commodities_trading_experience",
          "commodities_trading_frequency",
          "stocks_trading_experience",
          "stocks_trading_frequency",
          "other_derivatives_trading_experience",
          "other_derivatives_trading_frequency",
          "other_instruments_trading_experience",
          "other_instruments_trading_frequency",
          "employment_industry",
          "occupation",
          "education_level",
          "income_source",
          "net_income",
          "estimated_worth",
          "accept_risk"
        ];

        vm.firstToLowerCase = function(str) {
            return str.substr(0, 1).toLowerCase() + str.substr(1);
        }
        vm.convertDataName = function(key){
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

        vm.setCountry = function() {
            if (sessionStorage.hasOwnProperty('countryParams')) {
                vm.countryParams = JSON.parse(sessionStorage.countryParams);
                vm.data.countryCode = vm.countryParams.countryCode;
                vm.data.residence = vm.countryParams.countryCode;
                vm.hasResidence = true;
            }
        }

        vm.setCountry();
        vm.findPhoneCode = function(country) {
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
                _.forEach(get_settings, (val, key) => {
                  if(vm.formData.indexOf(key) > -1){
                    if (key != 'date_of_birth') {
                        var dataName = vm.convertDataName(key);
                        vm.data[dataName] = val;
                    } else {
                        var birth = new Date(val);
                        vm.data.dateOfBirth = birth.toISOString().slice(0, 10);
                    }
                  }
                });

                if (!get_settings.hasOwnProperty('phone')) {
                    vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
                    vm.data.phone = '+' + vm.phoneCodeObj.phone_idd;
                }

                if (get_settings.hasOwnProperty('place_of_birth') && !_.isEmpty(get_settings.place_of_birth)) {
                    vm.hasPlaceOfbirth = true;
                }
            });
        });

        vm.submitAccountOpening = function() {
            vm.resetAllErrors();
            if (vm.data.accept == true) {
                vm.data.acceptRisk = 1
            } else {
                vm.data.acceptRisk = 0
            }


            vm.params = {};
            _.forEach(vm.data, (value, key) => {
              var dataName = _.snakeCase(key);
              if(vm.requestData.indexOf(dataName) > -1){
                if(dataName !== 'date_of_birth'){
                  vm.params[dataName] = value;
                }
                else {
                  vm.data.birthDate = !appStateService.hasMLT ? vm.data.userDateOfBirth.toISOString().slice(0, 10) : vm.data.dateOfBirth;
                  vm.params.date_of_birth = vm.data.birthDate;
                }
              }
            });
            websocketService.sendRequestFor.createMaltainvestAccountSend(vm.params);
        };


        $scope.$on('new_account_maltainvest:error', (e, error) => {
            if (error.hasOwnProperty('details')) {
                $scope.$applyAsync(() => {
                  _.forEach(vm.requestData, (value, key) => {
                    if(error.details.hasOwnProperty(value)) {
                      var errorName = vm.convertDataName(value) + 'Error';
                      var errorMessageName = vm.convertDataName(value) + 'ErrorMessage';
                      vm[errorName] = true;
                      vm[errorMessageName] = error.details[value];
                    }
                  });
                });
            }
            else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on('new_account_maltainvest', (e, new_account_maltainvest) => {
            websocketService.authenticate(new_account_maltainvest.oauth_token);
            vm.selectedAccount = new_account_maltainvest.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount = vm.selectedAccount;
        });

    }
})();
