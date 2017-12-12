/**
 * @name maltainvest-account-opening controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.pages.maltainvest-account-opening")
        .controller("MaltainvestAccountOpeningController", MaltainvestAccountOpening);

    MaltainvestAccountOpening.$inject = [
        "$scope",
        "$filter",
        "$ionicModal",
        "websocketService",
        "appStateService",
        "accountService",
        "alertService",
        "clientService",
        "validationService",
        "realAccountOpeningOptions",
        "maltainvestAcountOpeningOptions"
    ];

    function MaltainvestAccountOpening(
        $scope,
        $filter,
        $ionicModal,
        websocketService,
        appStateService,
        accountService,
        alertService,
        clientService,
        validationService,
        realAccountOpeningOptions,
        maltainvestAcountOpeningOptions
    ) {
        const vm = this;
        vm.data = {};
        vm.errors = {};
        vm.disableUpdatebutton = false;
        vm.taxRequirement = false;
        vm.settingTaxResidence = [];
        vm.options = _.merge(maltainvestAcountOpeningOptions, realAccountOpeningOptions);
        vm.validation = validationService;
        const loginid = accountService.getDefault().id;
        const isVirtual = clientService.isAccountOfType('virtual', loginid);
        vm.data.linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
            "en"}/terms-and-conditions.html`;
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
            "tax_identification_number",
            "account_turnover",
            "account_opening_reason",
            "source_of_wealth",
            "employment_status"
        ];

        $ionicModal
            .fromTemplateUrl("js/pages/maltainvest-account-opening/tax-residence.modal.html", {
                scope: $scope
            })
            .then(modal => {
                vm.modalCtrl = modal;
            });

        vm.closeModal = function() {
            if (vm.modalCtrl) vm.modalCtrl.hide();
        };

        vm.showTaxResidenceItems = function() {
            vm.settingTaxResidence = _.words(vm.data.tax_residence);
            _.forEach(vm.residenceList, (value, key) => {
                if (vm.settingTaxResidence.indexOf(value.value) > -1) {
                    vm.residenceList[key].checked = true;
                } else {
                    vm.residenceList[key].checked = false;
                }
            });
            vm.modalCtrl.show();
        };

        // set all errors to false
        vm.resetAllErrors = function() {
            vm.error = {};
        };

        $scope.$on("residence_list", (e, residence_list) => {
            vm.residenceList = residence_list;
            websocketService.sendRequestFor.accountSetting();
        });

        // get phone code of user's country
        vm.findPhoneCode = function(country) {
            return country.value === vm.data.residence;
        };

        $scope.$on("states_list", (e, states_list) => {
            $scope.$applyAsync(() => {
                vm.statesList = states_list;
            });
        });

        // get some values which are set by user before
        $scope.$on("get_settings", (e, get_settings) => {
            $scope.$applyAsync(() => {
                _.forEach(get_settings, (val, key) => {
                    if (vm.requestData.indexOf(key) > -1) {
                        if (key === "date_of_birth") {
                            vm.data[key] = new Date(val * 1000);
                        } else if (val) {
                            vm.data[key] = val;
                        }
                    } else if (key === "country_code") {
                        vm.hasResidence = true;
                        vm.data.residence = get_settings.country_code;
                        websocketService.sendRequestFor.statesListSend(vm.data.residence);
                    }
                });
                if (!get_settings.hasOwnProperty("phone")) {
                    vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
                    if (vm.phoneCodeObj.hasOwnProperty("phone_idd")) {
                        $scope.$applyAsync(() => {
                            vm.data.phone = `+${vm.phoneCodeObj.phone_idd}`;
                        });
                    }
                }
                if (vm.data.tax_residence) {
                    vm.settingTaxResidence = _.words(vm.data.tax_residence);
                    // check the "checked" value to true for every residence in residence list which is in user tax residences
                    vm.selectedTaxResidencesName = null;
                    for (let index = vm.settingTaxResidence.length; index--; ) {
                        const taxResidence = _.find(vm.residenceList, (value, key) => {
                            if (vm.settingTaxResidence[index] === vm.residenceList[key].value) {
                                vm.residenceList[key].checked = true;
                            }
                            return vm.settingTaxResidence[index] === vm.residenceList[key].value;
                        });
                        if (taxResidence) {
                            vm.selectedTaxResidencesName = vm.selectedTaxResidencesName
                                ? `${vm.selectedTaxResidencesName + taxResidence.text}, `
                                : `${taxResidence.text}, `;
                        }
                    }

                    $scope.$applyAsync(() => {
                        vm.selectedTaxResidencesName = _.trimEnd(vm.selectedTaxResidencesName, ", ");
                    });
                }
            });
        });

        vm.setTaxResidence = function() {
            vm.taxRequirement = true;
            vm.selectedTaxResidencesName = null;
            vm.data.tax_residence = null;
            _.forEach(vm.residenceList, (value, key) => {
                if (value.checked) {
                    vm.selectedTaxResidencesName = vm.selectedTaxResidencesName
                        ? `${vm.selectedTaxResidencesName + value.text}, `
                        : `${value.text}, `;
                    vm.data.tax_residence = vm.data.tax_residence
                        ? `${vm.data.tax_residence + value.value},`
                        : `${value.value},`;
                }
            });
            vm.data.tax_residence = vm.data.tax_residence != null ? _.trimEnd(vm.data.tax_residence, ",") : null;
            vm.selectedTaxResidencesName =
                vm.selectedTaxResidencesName != null ? _.trimEnd(vm.selectedTaxResidencesName, ", ") : null;
            vm.closeModal();
        };

        vm.submitAccountOpening = function() {
            vm.disableUpdatebutton = true;
            vm.resetAllErrors();
            vm.data.accept_risk = vm.data.accept === true ? 1 : 0;
            vm.params = {};
            _.forEach(vm.data, (value, key) => {
                if (vm.requestData.indexOf(key) > -1) {
                    if (key === "date_of_birth") {
                        vm.params[key] = $filter("date")(value, "yyyy-MM-dd");
                    } else if (key === "secret_question" || key === "secret_answer") {
                        if (!vm.readOnly) {
	                        vm.params[key] = _.trim(value);
                        }
                    } else {
                        vm.params[key] = _.trim(value);
                    }
                }
            });
            websocketService.sendRequestFor.createMaltainvestAccountSend(vm.params);
        };

        $scope.$on("new_account_maltainvest:error", (e, error) => {
            vm.disableUpdatebutton = false;
            if (error.hasOwnProperty("details")) {
                $scope.$apply(() => {
                    vm.errors = error.details;
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on("new_account_maltainvest", (e, new_account_maltainvest) => {
            vm.disableUpdatebutton = false;
            websocketService.authenticate(new_account_maltainvest.oauth_token);
            const selectedAccount = new_account_maltainvest.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount = selectedAccount;
        });

        vm.openTermsAndConditions = () =>
            window.open(vm.data.linkToTermAndConditions, "_blank");

        vm.init = function() {
            vm.resetAllErrors();
            websocketService.sendRequestFor.residenceListSend();
            vm.readOnly = !isVirtual;
        };

        vm.init();
    }
})();
