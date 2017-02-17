/**
 * @name Profile Module
 * @author Morteza Tavanarad
 * @contributors []
 * @since 11/21/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.profile.controllers')
        .controller('ProfileController', Profile);

    Profile.$inject = ['$scope', '$translate', '$ionicModal', 'alertService',
        'appStateService', 'websocketService', 'accountService'
    ];

    function Profile($scope, $translate, $ionicModal, alertService,
        appStateService, websocketService, accountService) {
        var vm = this;
        vm.states = [];
        vm.disableUpdateButton = true;
        vm.isDataLoaded = false;
        vm.taxRequirement = false;
        vm.checkFinancial = function() {
            vm.account = accountService.getDefault();
            vm.isFinancial = _.startsWith(vm.account.id, "MF") ? true : false;
        }
        vm.checkFinancial();

        $scope.$on('get_settings', (e, response) => {
            $scope.$applyAsync(() => {
                vm.profile = response;
                if (vm.profile.date_of_birth) {
                    vm.profile.date_of_birth = new Date(vm.profile.date_of_birth * 1000).toISOString('yyyy-mm-dd').slice(0, 10);
                }
                websocketService.sendRequestFor.residenceListSend();
                vm.isDataLoaded = true;
            });
        });

        $scope.$on('set-settings', (e, response) => {
            if (response) {
                $translate(['profile.success', 'profile.success_message'])
                    .then((translation) => {
                        alertService.displayAlert(translation['profile.success'],
                            translation['profile.success_message']);
                    });
            } else {
                $translate('profile.error_message')
                    .then((translation) => {
                        alertService.displayError(translation['profile.error_message']);
                    });
            }
            vm.disableUpdateButton = false;
        });

        $scope.$on('set-settings:error', (e, message) => {
            alertService.displayError(message);
            vm.disableUpdateButton = false;
        });

        $scope.$on('residence_list', (e, response) => {
            vm.residenceList = response;
            if (response) {
                var country = _.find(response, ['text', vm.profile.country]);
                if (country) {
                    websocketService.sendRequestFor.statesListSend(country.value);
                }
                if (vm.profile.tax_residence) {
                    vm.settingTaxResidence = _.words(vm.profile.tax_residence);
                    // check the "checked" value to true for every residence in residence list which is in user tax residences
                    vm.selectedTaxResidencesName = null;
                    _.forEach(vm.residenceList, (value, key) => {
                      if(vm.settingTaxResidence.indexOf(value.value) > -1){
                        vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                        vm.residenceList[key].checked = true;
                      }
                        // vm.indexOfResidence = vm.settingTaxResidence.indexOf(value.value);

                    });
                    $scope.$applyAsync(() => {
                        vm.selectedTaxResidencesName = _.trimEnd(vm.selectedTaxResidencesName, ", ");
                    });
                }
            }
        });

        $scope.$on('states_list', (e, response) => {
            if (response) {
                $scope.$applyAsync(() => {
                    vm.states = response;
                    vm.disableUpdateButton = false;
                });
            }
        });

        $scope.$on('authorize', (e, response) => {
            init();
        });

        init();

        vm.submit = function() {
            vm.disableUpdateButton = true;
            updateProfile();
        };

        function getProfile() {
            websocketService.sendRequestFor.accountSetting();
        }

        function updateProfile() {
            var address = {
                address_line_1: vm.profile.address_line_1,
                address_line_2: vm.profile.address_line_2,
                address_city: vm.profile.address_city,
                address_state: vm.profile.address_state,
                address_postcode: vm.profile.address_postcode,
                phone: vm.profile.phone,
                tax_residence: vm.profile.tax_residence,
                tax_identification_number: vm.profile.tax_identification_number,
                place_of_birth: vm.profile.place_of_birth
            };

            websocketService.sendRequestFor.setAccountSettings(address);
        }

        $ionicModal.fromTemplateUrl('js/pages/profile/tax-residence.modal.html', {
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
            vm.profile.tax_residence = null;
            _.forEach(vm.residenceList, (value, key) => {
                if (value.checked) {
                  vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                  vm.profile.tax_residence = vm.profile.tax_residence ? (vm.profile.tax_residence + value.value + ',') : (value.value + ',');
                }
            });

              vm.profile.tax_residence = vm.profile.tax_residence != null ? _.trimEnd(vm.profile.tax_residence, ","): null;
              vm.selectedTaxResidencesName = vm.selectedTaxResidencesName != null ? _.trimEnd(vm.selectedTaxResidencesName, ", "): null;
              vm.closeModal();
        }


        function init() {
            getProfile();
            vm.isVirtualAccount = appStateService.virtuality;
        }
    }
})();
