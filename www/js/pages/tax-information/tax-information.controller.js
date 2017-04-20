/**
 * @name Tax Information controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 02/14/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.tax-information.controllers')
        .controller('TaxInformationController', TaxInformation);

    TaxInformation.$inject = ['$scope', '$translate', '$ionicModal', 'websocketService', 'alertService'];

    function TaxInformation($scope, $translate, $ionicModal, websocketService, alertService) {
      var vm = this;
      vm.data = {};
      vm.changed = false;
      vm.showNotChangedWarning = false;
      vm.disableUpdateButton = false;
      vm.requestData = [
        "tax_identification_number",
        "tax_residence",
        "residence",
        'address_city',
        "place_of_birth",
        "address_line_1",
        "address_line_2",
        "address_state",
        "address_postcode",
        "phone"
      ];

      websocketService.sendRequestFor.residenceListSend();

      _.defer(() => {
        websocketService.sendRequestFor.accountSetting();
        }, vm.residenceList);

      $scope.$on('residence_list', (e, residence_list) => {
        vm.residenceList = residence_list;
      });

      $scope.$on('get_settings', (e, get_settings) => {
        if (get_settings) {
          vm.getSettings = get_settings;
          // set all information from get_setting to data array to pass to API later as params
          _.forEach(vm.getSettings, (value, key) => {
            if (vm.requestData.indexOf(key) > -1) {
              if (key !== 'tax_residence') {
                vm.convertedValue = _.camelCase(key);
                vm.data[vm.convertedValue] = value;
              }
              else {
                vm.settingTaxResidence = _.words(vm.getSettings.tax_residence);
                vm.data.taxResidence = vm.getSettings.tax_residence;
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
            }
          });
        }
      });

        $ionicModal.fromTemplateUrl('js/pages/tax-information/tax-residence.modal.html', {
          scope: $scope
        }).then(function(modal) {
          vm.modalCtrl = modal;
        });

        vm.closeModal = function() {
          if (vm.modalCtrl) vm.modalCtrl.hide();
        }

        vm.showTaxResidenceItems = function() {
          _.forEach(vm.residenceList, (value, key) => {
            if (vm.settingTaxResidence.indexOf(value.value) > -1) {
            vm.residenceList[key].checked = true;
            } else {
              vm.residenceList[key].checked = false;
            }
          });
          vm.modalCtrl.show();
        }

        vm.setTaxResidence = function() {
          vm.taxRequirement = true;
            vm.selectedTaxResidencesName = null;
            vm.data.taxResidence = null;
            _.forEach(vm.residenceList, (value, key) => {
              if (value.checked) {
                vm.selectedTaxResidencesName = vm.selectedTaxResidencesName ? (vm.selectedTaxResidencesName + value.text + ', ') : (value.text + ', ');
                vm.data.taxResidence = vm.data.taxResidence ? (vm.data.taxResidence + value.value + ',') : (value.value + ',');
              }
            });

            vm.data.taxResidence = vm.data.taxResidence != null ? _.trimEnd(vm.data.taxResidence, ","): null;
            vm.selectedTaxResidencesName = vm.selectedTaxResidencesName != null ? _.trimEnd(vm.selectedTaxResidencesName, ", "): null;
            vm.closeModal();
        }

        vm.submitTaxInformation = function() {
          vm.changed = false;
          vm.showNotChangedWarning = false;
          vm.params = {};
          _.forEach(vm.data, (value, key) => {
            vm.dataName = _.snakeCase(key);
            if (vm.requestData.indexOf(vm.dataName) > -1 && value != null) {
              vm.params[vm.dataName] = value;
              if (vm.params[vm.dataName] !== vm.getSettings[vm.dataName]) {
                vm.changed = true;
              }
            }
          });
          if (vm.changed) {
            vm.showNotChangedWarning = false;
            vm.disableUpdateButton = true;
            websocketService.sendRequestFor.setAccountSettings(vm.params);
          } else {
            vm.showNotChangedWarning = true;
          }
        }

        $scope.$on('set-settings', (e, set_settings) => {
          $scope.$applyAsync(() => {
            vm.disableUpdateButton = false;
            if (set_settings) {
              $translate(['tax-information.success', 'tax-information.success_message'])
                .then((translation) => {
                alertService.displayAlert(translation['tax-information.success'],
                translation['tax-information.success_message']);
              });
            }
          });
        });

        $scope.$on('set-settings:error', (e, error) => {
          vm.disableUpdateButton = false;
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
    }
})();
