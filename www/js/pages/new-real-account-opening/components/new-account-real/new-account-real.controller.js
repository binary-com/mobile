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

    NewAccountReal.$inject = ['$scope', '$filter', '$ionicModal', 'websocketService', 'appStateService', 'accountService', 'alertService'];

    function NewAccountReal($scope, $filter, $ionicModal, websocketService, appStateService, accountService, alertService) {
        var vm = this;
        vm.data = {};
        vm.hasResidence = false;
        vm.formData = [
            'salutation',
            'first_name',
            'last_name',
            'date_of_birth',
            'residence',
            "place_of_birth",
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
            'tax_residence',
            'tax_identification_number'
        ];


        $ionicModal.fromTemplateUrl('js/pages/new-real-account-opening/components/new-account-real/tax-residence.modal.html', {
            scope: $scope
        }).then(function(modal) {
            vm.modalCtrl = modal;
        });

        vm.closeModal = function() {
          if (vm.modalCtrl) vm.modalCtrl.hide();
        }

        vm.showTaxResidenceItems = function() {
            vm.modalCtrl.show();
        }

        vm.setUserCountry = function() {
            // check if there are country and country code of user in sessionStorage
            // some users from past don't have country chosen in signup
            if (sessionStorage.hasOwnProperty('countryParams')) {
                vm.countryParams = JSON.parse(sessionStorage.countryParams);
                vm.data.countryCode = vm.countryParams.countryCode;
                vm.data.residence = vm.countryParams.countryCode;
                vm.hasResidence = true;
            }
        }

        // set all fields errors to false
        vm.resetAllErrors = function() {
            _.forEach(vm.formData, (value, key) => {
                var errorName = _.camelCase(value) + 'Error';
                vm[errorName] = false;
            });
        }

        vm.setUserCountry();
        vm.resetAllErrors();

        // get states of the user country
        websocketService.sendRequestFor.statesListSend(vm.data.countryCode);
        $scope.$on('states_list', (e, states_list) => {
            vm.statesList = states_list;
        });

        // get phone code of the user country
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
            if (vm.data.taxResidence) {
                vm.settingTaxResidence = _.words(vm.data.taxResidence);
                // check the "checked" value to true for every residence in residence list which is in user tax residences
                vm.selectedTaxResidencesName = null;
                _.forEach(vm.residenceList, (value, key) => {
                    if (vm.settingTaxResidence.indexOf(value.value) > -1) {
                        vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                        vm.residenceList[key].checked = true;
                    }
                });
                $scope.$applyAsync(() => {
                    vm.selectedTaxResidencesName = _.trimEnd(vm.selectedTaxResidencesName, ", ");
                });
            }
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

        vm.setTaxResidence = function() {
            vm.selectedTaxResidencesName = null;
            vm.data.taxResidence = null;
            _.forEach(vm.residenceList, (value, key) => {
                if (value.checked) {
                    vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                    vm.data.taxResidence = vm.data.taxResidence ? (vm.data.taxResidence + value.value + ',') : (value.value + ',');
                }
            });

            vm.data.taxResidence = vm.data.taxResidence != null ? _.trimEnd(vm.data.taxResidence, ",") : null;
            vm.selectedTaxResidencesName = vm.selectedTaxResidencesName != null ? _.trimEnd(vm.selectedTaxResidencesName, ", ") : null;
            vm.closeModal();
        }


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
