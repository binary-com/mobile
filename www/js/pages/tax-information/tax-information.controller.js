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

    TaxInformation.$inject = ['$scope', '$ionicModal', 'websocketService'];

    function TaxInformation($scope, $ionicModal, websocketService) {
        var vm = this;
        vm.data = {};
				vm.changed = false;
				vm.showNotChangedWarning = false;
        vm.requestData = [
            'tax_identification_number',
            'tax_residence',
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
        }, vm.taxResidenceList);

        $scope.$on('residence_list', (e, residence_list) => {
            vm.residenceList = residence_list;
            vm.taxResidenceList = residence_list;
        });

        $scope.$on('get_settings', (e, get_settings) => {
					vm.getSettings = get_settings;
            _.forEach(get_settings, (value, key) => {
                if (vm.requestData.indexOf(key) > -1) {
                    vm.convertedValue = _.camelCase(key);
                    vm.data[vm.convertedValue] = value;
                }
            });
            if (get_settings) {
                vm.indexOfResidence = _.findKey(vm.taxResidenceList, (value, key) => {
                    return value.value === get_settings.tax_residence;
                });
                $scope.$applyAsync(() => {
                    if (vm.indexOfResidence > -1) {
                        vm.selectedTaxResidencesName = vm.taxResidenceList[vm.indexOfResidence].text;
                        vm.taxResidenceList[vm.indexOfResidence].checked = true;
                    };
                });

            }
        });

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
            vm.selectedTaxResidencesName = "";
            vm.data.taxResidence = "";
            _.forEach(vm.taxResidenceList, (value, key) => {
                if (value.checked) {
                    vm.selectedTaxResidencesName = vm.selectedTaxResidencesName + value.text + ', ';
                    vm.data.taxResidence = vm.data.taxResidence + value.value + ',';
                }
            });
            vm.data.taxResidence = _.trimEnd(vm.data.taxResidence, ",");
            vm.selectedTaxResidencesName = _.trimEnd(vm.selectedTaxResidencesName, ", ");
            vm.closeModal();
        }

        vm.submitTaxInformation = function() {
					vm.changed = false;
					vm.showNotChangedWarning = false;
					vm.updated = false;
					vm.updateError = false;
					vm.updateErrorMessage = "";
            vm.params = {};
            _.forEach(vm.data, (value, key) => {
                vm.dataName = _.snakeCase(key);
                if (vm.requestData.indexOf(vm.dataName) > -1) {
                    vm.params[vm.dataName] = value;
										if(vm.params[vm.dataName] !== vm.getSettings[vm.dataName]){
											vm.changed = true;
										}
                }
            });
						if(vm.changed) {
							vm.showNotChangedWarning = false;
							websocketService.sendRequestFor.setAccountSettings(vm.params);
						}
						else {
							vm.showNotChangedWarning = true;
						}
        }

				$scope.$on('set-settings', (e, set_settings) => {
					$scope.$applyAsync(() => {
						vm.updated = true;
						vm.updateError = false;
					});
				});

				$scope.$on('set-settings:error', (e, error) => {
					$scope.$applyAsync(() => {
						vm.updated = false;
						vm.updateError = true;
						vm.updateErrorMessage = error;
					});
				});



    }
})();
