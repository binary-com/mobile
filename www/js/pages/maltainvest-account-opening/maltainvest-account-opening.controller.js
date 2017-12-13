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
        vm.errors = {};
        vm.disableUpdatebutton = false;
        vm.taxRequirement = false;
        vm.settingTaxResidence = [];
        vm.hasResidence = false;
        let selectedTaxResidencesName = '';
        vm.options = _.merge(maltainvestAcountOpeningOptions, realAccountOpeningOptions);
        vm.validation = validationService;
        const loginid = accountService.getDefault().id;
        const isVirtual = clientService.isAccountOfType('virtual', loginid);
        vm.data.linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
            "en"}/terms-and-conditions.html`;
        vm.data = {
            salutation: '',
            first_name: '',
            last_name: '',
            date_of_birth: '',
            residence: '',
            place_of_birth: '',
            address_line_1: '',
            address_line_2: '',
            address_city: '',
            address_state: '',
            address_postcode: '',
            phone: '',
            forex_trading_experience: '',
            forex_trading_frequency: '',
            indices_trading_experience: '',
            indices_trading_frequency: '',
            commodities_trading_experience: '',
            commodities_trading_frequency: '',
            stocks_trading_experience: '',
            stocks_trading_frequency: '',
            other_derivatives_trading_experience: '',
            other_derivatives_trading_frequency: '',
            other_instruments_trading_experience: '',
            other_instruments_trading_frequency: '',
            employment_industry: '',
            occupation: '',
            education_level: '',
            income_source: '',
            net_income: '',
            estimated_worth: '',
            accept_risk: '',
            tax_residence: '',
            tax_identification_number: '',
            account_turnover: '',
            account_opening_reason: '',
            source_of_wealth: '',
            employment_status: ''
        };

        if (!isVirtual) {
            vm.data.secret_question = '';
            vm.data.secret_answer = '';
        };

        $ionicModal
            .fromTemplateUrl("js/pages/maltainvest-account-opening/tax-residence.modal.html", {
                scope: $scope
            })
            .then(modal => {
                vm.modalCtrl = modal;
            });

        vm.closeModal = () => {
            if (vm.modalCtrl) vm.modalCtrl.hide();
        };

        vm.showTaxResidenceItems = () => vm.modalCtrl.show();

        $scope.$on("residence_list", (e, residence_list) => {
            vm.residenceList = residence_list;
            websocketService.sendRequestFor.accountSetting();
        });

        $scope.$on("states_list", (e, states_list) => {
            $scope.$applyAsync(() => {
                vm.statesList = states_list;
            });
        });

        // get some values which are set by user before
        $scope.$on("get_settings", (e, get_settings) => {
            $scope.$applyAsync(() => {
                for (var k in vm.data) {
                    if (get_settings[k]) vm.data[k] = get_settings[k];
                }
                vm.data.date_of_birth = new Date(vm.data.date_of_birth * 1000);
                if (get_settings.country_code) {
                    vm.hasResidence = true;
                    vm.data.residence = get_settings.country_code;
                    websocketService.sendRequestFor.statesListSend(get_settings.country_code);
                    if (!vm.data.phone) {
                        const phoneCodeObj = vm.residenceList.find(country => country.value === get_settings.country_code);
                    }
                }
                if (vm.data.tax_residence) {
                    vm.settingTaxResidence = _.words(vm.data.tax_residence);
                    vm.residenceList = vm.residenceList.map(res => {
                        if (vm.settingTaxResidence.indexOf(res.value) > -1) {
                            res.checked = true;
                        }
                        return res;
                });
                    const checkedValues = vm.residenceList.filter(res => res.checked);
                    vm.selectedTaxResidencesName = checkedValues.map(value => value.text).join(', ');
                }
            });
        });

        vm.setTaxResidence = () => {
            vm.taxRequirement = true;
            const checkedValues = vm.residenceList.filter(res => res.checked);
            vm.selectedTaxResidencesName = checkedValues.map(value => value.text).join(', ');
            vm.data.tax_residence = checkedValues.map(value => value.value).join(', ');
            vm.closeModal();
        };

        vm.submitAccountOpening = () => {
            vm.disableUpdatebutton = true;
            vm.error = {};
            const params = _.clone(vm.data);
            params.accept_risk = vm.data.accept ? 1 : 0;
            params.date_of_birth = $filter("date")(params.date_of_birth, "yyyy-MM-dd");
            websocketService.sendRequestFor.createMaltainvestAccountSend(params);
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

        vm.init = () => {
            vm.error = {};
            websocketService.sendRequestFor.residenceListSend();
            vm.readOnly = !isVirtual;
        };

        vm.init();
    }
})();
