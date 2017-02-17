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

    NewAccountMaltainvest.$inject = ['$scope', '$state', '$filter', '$ionicModal', 'websocketService', 'appStateService', 'accountService', 'alertService'];

    function NewAccountMaltainvest($scope, $state, $filter, $ionicModal, websocketService, appStateService, accountService, alertService) {
        var vm = this;
        vm.data = {};
        vm.hasPlaceOfbirth = false;
        vm.taxRequirement = false;
        vm.formData = [
            'salutation',
            'first_name',
            'last_name',
            'date_of_birth',
            "place_of_birth",
            'country',
            'address_line_1',
            'address_line_2',
            'address_city',
            'address_state',
            'address_postcode',
            'phone',
            'secret_question',
            'secret_answer',
            'tax_residence',
            'tax_identification_number'
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
            "accept_risk",
            "tax_residence",
            "tax_identification_number"
        ];


        $ionicModal.fromTemplateUrl('js/pages/new-real-account-opening/components/new-account-maltainvest/tax-residence.modal.html', {
            scope: $scope
        }).then(function(modal) {
            vm.modalCtrl = modal;
        });

        function hideModal() {
            if (vm.modalCtrl) {
                vm.modalCtrl.hide();
            }
        }

        vm.closeModal = function() {
            hideModal();
        }

        vm.residenceDisable = function(index, residence) {
            return (residence.disabled === "DISABLED" ? true : false);
        }

        vm.showTaxResidenceItems = function() {
            vm.modalCtrl.show();
        }

        vm.setTaxResidence = function() {
          vm.taxRequirement = true;
          vm.selectedTaxResidencesName = null;
          vm.data.taxResidence = null;
          _.forEach(vm.taxResidenceList, (value, key) => {
              if (value.checked) {
                vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                vm.data.taxResidence = vm.data.taxResidence ? (vm.data.taxResidence + value.value + ',') : (value.value + ',');
              }
          });

            vm.data.taxResidence = vm.data.taxResidence != null ? _.trimEnd(vm.data.taxResidence, ","): null;
            vm.selectedTaxResidencesName = vm.selectedTaxResidencesName != null ? _.trimEnd(vm.selectedTaxResidencesName, ", "): null;
            vm.closeModal();
        }

        // set all errors to false
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
            vm.taxResidenceList = residence_list;
            if (vm.data.taxResidence) {
                vm.settingTaxResidence = _.words(vm.data.taxResidence);
                // check the "checked" value to true for every residence in residence list which is in user tax residences
                vm.selectedTaxResidencesName = null;
                _.forEach(vm.residenceList, (value, key) => {
                  if(vm.settingTaxResidence.indexOf(value.value) > -1){
                    vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                    vm.residenceList[key].checked = true;
                  }
                });
                $scope.$applyAsync(() => {
                    vm.selectedTaxResidencesName = _.trimEnd(vm.selectedTaxResidencesName, ", ");
                });
            }
        });

        $scope.$applyAsync(() => {
            if (appStateService.hasMLT) {
                vm.isReadonly = true;
            }
        });
        // regexp pattern for validating name input
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
        // get user's country from sessionStorage if is existed
        vm.setCountry = function() {
            if (sessionStorage.hasOwnProperty('countryParams')) {
                vm.countryParams = JSON.parse(sessionStorage.countryParams);
                vm.data.countryCode = vm.countryParams.countryCode;
                vm.data.residence = vm.countryParams.countryCode;
                vm.hasResidence = true;
            }
        }

        vm.setCountry();

        // get phone code of user's country
        vm.findPhoneCode = function(country) {
            return country.value == vm.data.countryCode;
        }

        websocketService.sendRequestFor.statesListSend(vm.data.countryCode);
        $scope.$on('states_list', (e, states_list) => {
            vm.statesList = states_list;
        });

        // get some values which are set by user before
        websocketService.sendRequestFor.accountSetting();
        $scope.$on('get_settings', (e, get_settings) => {
            $scope.$applyAsync(() => {
                _.forEach(get_settings, (val, key) => {
                    if (vm.formData.indexOf(key) > -1) {
                        vm.convertedValue = _.camelCase(key);
                        if (key === 'date_of_birth') {
                          vm.data[vm.convertedValue] = new Date(val * 1000);
                        } else if (key === 'place_of_birth' && val) {
                          vm.hasPlaceOfbirth = true;
                          vm.data[vm.convertedValue] = val;
                        } else {
                          vm.data[vm.convertedValue] = val;
                        }
                    }
                });

                if (!get_settings.hasOwnProperty('phone')) {
                    vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
                    vm.data.phone = '+' + vm.phoneCodeObj.phone_idd;
                }
            });
        });

        vm.submitAccountOpening = function() {
            vm.resetAllErrors();
            vm.data.acceptRisk = vm.data.accept === true ? 1 : 0;

            vm.params = {};
            _.forEach(vm.data, (value, key) => {
                vm.dataName = _.snakeCase(key);
                if (vm.requestData.indexOf(vm.dataName) > -1) {
                    if (vm.dataName !== 'date_of_birth') {
                        vm.params[vm.dataName] = value;
                    } else {
                        vm.params[vm.dataName] =  $filter('date')(value, 'yyyy-MM-dd');
                    }
                }
            });
            websocketService.sendRequestFor.createMaltainvestAccountSend(vm.params);
        };

        $scope.$on('new_account_maltainvest:error', (e, error) => {
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

        $scope.$on('new_account_maltainvest', (e, new_account_maltainvest) => {
            websocketService.authenticate(new_account_maltainvest.oauth_token);
            vm.selectedAccount = new_account_maltainvest.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount = vm.selectedAccount;
        });

    }
})();
