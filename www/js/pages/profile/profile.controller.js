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
        "$ionicModal",
        "alertService",
        "appStateService",
        "websocketService",
        "accountService",
        "validationService",
        "clientService",
        "accountOptions"
    ];

    function Profile(
        $scope,
        $translate,
        $ionicModal,
        alertService,
        appStateService,
        websocketService,
        accountService,
        validationService,
        clientService,
        accountOptions
    ) {
        const vm = this;
        vm.profile = {};
        vm.errors = {};
        vm.taxInfoIsOptional = false;
        vm.validation = validationService;
        vm.isDataLoaded = false;
        vm.notAnyChanges = false;
        vm.disableUpdateButton = false;
        vm.hasResidence = false;
        vm.hasPOB = false;
        vm.hasAccountOpeningReason = false;
        vm.touchedTaxResidence = false;
        vm.settingTaxResidence = [];
        vm.options = accountOptions;
        const realAccountFields = {
            address_line_1           : '',
            address_line_2           : '',
            address_city             : '',
            address_state            : '',
            address_postcode         : '',
            phone                    : '',
            tax_identification_number: '',
            tax_residence            : '',
            place_of_birth           : '',
            account_opening_reason   : ''
        };

        $ionicModal
            .fromTemplateUrl("js/pages/profile/tax-residence.modal.html", {
                scope: $scope
            })
            .then(modal => {
                vm.modalCtrl = modal;
            });

        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        vm.init = () => {
            const account = accountService.getDefault();
            const landingCompany = account.landing_company_name;
            vm.isVirtualAccount = isLandingCompanyOf('virtual', landingCompany);
            const accounts = accountService.getAll();
            const hasMaltainvestAccount = !!_.find(accounts, account =>
                isLandingCompanyOf('maltainvest', account.landing_company_name));
            vm.taxInfoIsOptional = !isLandingCompanyOf('maltainvest', landingCompany) && !hasMaltainvestAccount;
            if (!vm.isVirtualAccount) {
                websocketService.sendRequestFor.residenceListSend();
            } else if (vm.isVirtualAccount && !account.country) {
                websocketService.sendRequestFor.residenceListSend();
            } else {
                getProfile();
            }
        };

        const getProfile = () => websocketService.sendRequestFor.accountSetting();
        const getPhoneCode = countryCode =>
            _.find(vm.residenceList, country => country.value === countryCode).phone_idd;

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
                if (get_settings.place_of_birth) {
                    vm.hasPOB = true;
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
                    vm.residenceList = _.map(vm.residenceList, res => {
                        if (vm.settingTaxResidence.indexOf(res.value) > -1) {
                            res.checked = true;
                        }
                        return res;
                    });
                    const checkedValues = _.filter(vm.residenceList, res => res.checked);
                    vm.selectedTaxResidencesName = _.map(checkedValues, value => value.text).join(', ');
                }
                if (vm.profile.account_opening_reason) {
                    vm.hasAccountOpeningReason = true;
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
            vm.touchedTaxResidence = true;
            const checkedValues = _.filter(vm.residenceList, res => res.checked);
            vm.selectedTaxResidencesName = _.map(checkedValues, value => value.text).join(', ');
            vm.profile.tax_residence = _.map(checkedValues, value => value.value).join(',');
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