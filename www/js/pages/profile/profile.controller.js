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
        "accountService",
        "validationService"
    ];

    function Profile(
        $scope,
        $translate,
        $filter,
        $ionicModal,
        alertService,
        appStateService,
        websocketService,
        accountService,
        validationService
    ) {
        const vm = this;
        vm.profile = {};
        vm.errors = {};
        vm.validations = validationService;
        vm.isDataLoaded = false;
        vm.notAnyChanges = false;
        vm.disableUpdateButton = false;
        vm.hasResidence = false;
        vm.hasAccountOpeningReason = false;
        vm.settingTaxResidence = [];
        const virtualAccountFields = {
            email: '',
            country: ''
        };
        const realAccountFields = {
            address_line_1: '',
            address_line_2: '',
            address_city: '',
            address_state: '',
            address_postcode: '',
            phone: '',
            tax_identification_number: '',
            tax_residence: '',
            place_of_birth: '',
            account_opening_reason: ''
        };
        vm.accountOpeningReasonsEnum = [
            {id: 'speculative', value: "Speculative"},
            {id: 'income_earning', value: "Income Earning"},
            {id: 'hedging', value: "Hedging"}
        ];

        $ionicModal
            .fromTemplateUrl("js/pages/profile/tax-residence.modal.html", {
              scope: $scope
            })
            .then(modal => {
              vm.modalCtrl = modal;
            });

        vm.init = () => {
            vm.isVirtualAccount = !!appStateService.virtuality;
            if (!vm.isVirtualAccount) {
                vm.account = accountService.getDefault();
                vm.isFinancial = !!_.startsWith(vm.account.id, "MF");
                websocketService.sendRequestFor.residenceListSend();
            } else {
                getProfile();
            }
        };

        const getProfile = () => websocketService.sendRequestFor.accountSetting();

        $scope.$on("residence_list", (e, response) => {
            $scope.$applyAsync(() => {
                vm.residenceList = response;
                getProfile();
            });
        });

        const setProfile = function(get_settings) {
            vm.isDataLoaded = true;
            if (vm.isVirtualAccount) {
                vm.profile = get_settings;
                if (get_settings.country_code) {
                    const countryCode = get_settings.country_code;
                    vm.hasResidence = true;
                    vm.profile.residence = countryCode;
                }
            } else {
              vm.profile = get_settings;
              if (get_settings.date_of_birth) {
                vm.profile.date_of_birth = new Date(get_settings.date_of_birth * 1000);
              }
              if (get_settings.country_code) {
                const countryCode = get_settings.country_code;
                vm.hasResidence = true;
                vm.profile.residence = countryCode;
                websocketService.sendRequestFor.statesListSend(countryCode);
                if (!get_settings.phone) {
                  const phoneCode = getPhoneCode(countryCode);
                  vm.profile.phone = phoneCode ? `+${phoneCode}` : '';
                }
              }
              if (vm.profile.tax_residence) {
                vm.settingTaxResidence = _.words(vm.profile.tax_residence);
                vm.residenceList = vm.residenceList.map(res => {
                  if (vm.settingTaxResidence.indexOf(res.value) > -1) {
                    res.checked = true;
                  }
                  return res;
                });
                const checkedValues = vm.residenceList.filter(res => res.checked);
                vm.selectedTaxResidencesName = checkedValues.map(value => value.text).join(', ');
              }
            };
        };

        $scope.$on("get_settings", (e, get_settings) => {
            vm.getSettings = angular.copy(get_settings);
            setProfile(get_settings);
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
                getProfile();
            }
        });

        $scope.$on("set-settings:error", (e, error) => {
            vm.disableUpdatebutton = false;
            if (!vm.isVirtualAccount && error.hasOwnProperty("details")) {
                $scope.$apply(() => {
                    vm.errors = error.details;
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });



        vm.closeModal = () => {
            if (vm.modalCtrl) {
                vm.modalCtrl.hide();
                appStateService.modalIsOpen = false;
            }
        };

        vm.showTaxResidenceItems = () => vm.modalCtrl.show();


        vm.setTaxResidence = () => {
            vm.taxRequirement = true;
            const checkedValues = vm.residenceList.filter(res => res.checked);
            vm.selectedTaxResidencesName = checkedValues.map(value => value.text).join(', ');
            vm.profile.tax_residence = checkedValues.map(value => value.value).join(',');
            vm.closeModal();
        };

        vm.updateProfile = function() {
            vm.disableUpdatebutton = true;
            vm.notAnyChanges = true;
            vm.error = {};
            let params = {};
            if (!vm.isVirtualAccount) {
                _.forEach(realAccountFields, (val, k) => {
                  if (vm.profile[k]) params[k] = vm.profile[k];
                });
                _.forEach(params, (val, k) => {
                    params[k] = _.trim(val);
                    if (params[k] !== vm.getSettings[k]) {
                        vm.notAnyChanges = false;
                    }
                    return params[k];
                });
                if (!vm.notAnyChanges) {
                    vm.disableUpdateButton = true;
                    websocketService.sendRequestFor.setAccountSettings(params);
                }
              } else {
                  params = {
                      residence: vm.profile.country
                  };
                  websocketService.sendRequestFor.setAccountSettings(params);
              }
          };

          vm.init();
        }
})();
