/**
 * @name Profile Module
 * @author Morteza Tavanarad
 * @contributors []
 * @since 11/21/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.profile.controllers").controller("ProfileController", Profile);

    Profile.$inject = [
        "$scope",
        "$translate",
        "$filter",
        "$ionicModal",
        "alertService",
        "appStateService",
        "websocketService",
        "accountService"
    ];

    function Profile(
        $scope,
        $translate,
        $filter,
        $ionicModal,
        alertService,
        appStateService,
        websocketService,
        accountService
    ) {
        const vm = this;
        vm.profile = {};
        vm.isDataLoaded = false;
        vm.notAnyChanges = false;
        vm.disableUpdateButton = false;
        vm.hasResidence = false;
        vm.settingTaxResidence = [];
        vm.virtualAccountFields = ["email", "country"];
        vm.realAccountFields = [
            "address_line_1",
            "address_line_2",
            "address_city",
            "address_state",
            "address_postcode",
            "phone",
            "tax_identification_number",
            "tax_residence",
            "place_of_birth"
        ];

        vm.init = function() {
            vm.isVirtualAccount = !!appStateService.virtuality;
            if (!vm.isVirtualAccount) {
                vm.account = accountService.getDefault();
                vm.isFinancial = !!_.startsWith(vm.account.id, "MF");
                websocketService.sendRequestFor.residenceListSend();
            } else {
                vm.getProfile();
            }
        };

        vm.getProfile = function() {
            websocketService.sendRequestFor.accountSetting();
        };

        $scope.$on("residence_list", (e, response) => {
            $scope.$applyAsync(() => {
                vm.residenceList = response;
                vm.getProfile();
            });
        });

        vm.setProfile = function(get_settings) {
            vm.isDataLoaded = true;
            if (vm.isVirtualAccount) {
                $scope.$applyAsync(() => {
                    vm.profile = get_settings;
                    if (get_settings.hasOwnProperty("country")) {
                        vm.hasResidence = true;
                    } else {
                        websocketService.sendRequestFor.residenceListSend();
                        vm.hasResidence = false;
                    }
                });
            } else {
                vm.profile = get_settings;
                if (vm.profile.date_of_birth) {
                    $scope.$applyAsync(() => {
                        vm.profile.date_of_birth = $filter("date")(vm.profile.date_of_birth * 1000, "yyyy-MM-dd");
                    });
                }
                if (vm.profile.tax_residence) {
                    vm.settingTaxResidence = _.words(vm.profile.tax_residence);
                    vm.selectedTaxResidencesName = null;
                    _.forEach(vm.residenceList, (value, key) => {
                        if (vm.settingTaxResidence.indexOf(value.value) > -1) {
                            vm.selectedTaxResidencesName = vm.selectedTaxResidencesName
                                ? `${vm.selectedTaxResidencesName + value.text}, `
                                : `${value.text}, `;
                            vm.residenceList[key].checked = true;
                        }
                    });
                    $scope.$applyAsync(() => {
                        vm.selectedTaxResidencesName = _.trimEnd(vm.selectedTaxResidencesName, ", ");
                    });
                }
                const country = _.find(vm.residenceList, ["text", vm.profile.country]);
                if (country) {
                    websocketService.sendRequestFor.statesListSend(country.value);
                }
            }
        };

        $scope.$on("get_settings", (e, get_settings) => {
            vm.getSettings = angular.copy(get_settings);
            vm.setProfile(get_settings);
        });

        $scope.$on("states_list", (e, states_list) => {
            $scope.$applyAsync(() => {
                vm.states = states_list;
            });
        });

        $scope.$on("set-settings", (e, response) => {
            vm.disableUpdateButton = false;
            vm.notAnyChanges = false;
            if (response) {
                $translate(["profile.success", "profile.success_message"]).then(translation => {
                    alertService.displayAlert(translation["profile.success"], translation["profile.success_message"]);
                });
                vm.getProfile();
            }
        });

        $scope.$on("set-settings:error", (e, error) => {
            if (!vm.isVirtualAccount && error.hasOwnProperty("details")) {
                Object.keys(error.details).forEach((key, index) => {
                    const errorField = key;
                    const ErrorMessage = error.details[key];
                    if (vm.realAccountFields.indexOf(errorField) > -1) {
                        vm[`${errorField}Error`] = true;
                        vm[`${errorField}ErrorMessage`] = ErrorMessage;
                    }
                });
            }
            vm.disableUpdateButton = false;
            alertService.displayError(error.message);
        });

        $ionicModal
            .fromTemplateUrl("js/pages/profile/tax-residence.modal.html", {
                scope: $scope
            })
            .then(modal => {
                vm.modalCtrl = modal;
            });

        vm.closeModal = function() {
            if (vm.modalCtrl) {
                vm.modalCtrl.hide();
                appStateService.modalIsOpen = false;
            }
        };

        vm.showTaxResidenceItems = function() {
            vm.settingTaxResidence = _.words(vm.profile.tax_residence);
            _.forEach(vm.residenceList, (value, key) => {
                if (vm.settingTaxResidence.indexOf(value.value) > -1) {
                    vm.residenceList[key].checked = true;
                } else {
                    vm.residenceList[key].checked = false;
                }
            });
            vm.modalCtrl.show();
            appStateService.modalIsOpen = true;
        };

        vm.setTaxResidence = function() {
            vm.taxRequirement = true;
            vm.selectedTaxResidencesName = null;
            vm.profile.tax_residence = null;
            _.forEach(vm.residenceList, (value, key) => {
                if (value.checked) {
                    vm.selectedTaxResidencesName = vm.selectedTaxResidencesName
                        ? `${vm.selectedTaxResidencesName + value.text}, `
                        : `${value.text}, `;
                    vm.profile.tax_residence = vm.profile.tax_residence
                        ? `${vm.profile.tax_residence + value.value},`
                        : `${value.value},`;
                }
            });
            vm.profile.tax_residence =
                vm.profile.tax_residence != null ? _.trimEnd(vm.profile.tax_residence, ",") : null;
            vm.selectedTaxResidencesName =
                vm.selectedTaxResidencesName != null ? _.trimEnd(vm.selectedTaxResidencesName, ", ") : null;
            vm.closeModal();
        };

        vm.updateProfile = function() {
            if (!vm.isVirtualAccount) {
                vm.params = {};
                vm.notAnyChanges = true;
                _.forEach(vm.realAccountFields, (value, key) => {
                    if (vm.profile[value] != null && vm.profile[value] !== undefined) {
                        if (vm.profile[value] === "address_postcode") {
                            vm.params[value] = vm.profile[value].trim();
                        } else {
                            vm.params[value] = vm.profile[value];
                        }
                        if (vm.params[value] !== vm.getSettings[value]) {
                            vm.notAnyChanges = false;
                        }
                    }
                });
                if (!vm.notAnyChanges) {
                    vm.disableUpdateButton = true;
                    websocketService.sendRequestFor.setAccountSettings(vm.params);
                }
            } else {
                const params = {
                    residence: vm.profile.country
                };
                websocketService.sendRequestFor.setAccountSettings(params);
            }
        };

        vm.validateGeneral = (function(val) {
            const regex = /[`~!@#$%^&*)(_=+[}{\]\\/";:?><,|\d]+/;
            return {
                test(val) {
                    const reg = regex.test(val);
                    return reg !== true;
                }
            };
        })();

        vm.validateAddress = (function(val) {
            const regex = /[`~!#$%^&*)(_=+[}{\]\\";:?><|]+/;
            return {
                test(val) {
                    const reg = regex.test(val);
                    return reg !== true;
                }
            };
        })();

        vm.init();
    }
})();
