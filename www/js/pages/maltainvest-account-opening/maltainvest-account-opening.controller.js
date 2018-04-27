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
        "accountOptions",
        "financialInformationOptions"
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
        accountOptions,
        financialInformationOptions
    ) {
        const vm = this;
        vm.errors = {};
        vm.settingTaxResidence = [];
        vm.disableUpdatebutton = false;
        vm.touchedTaxResidence = false;
        vm.hasResidence = false;
        vm.hasPOB = false;
        const landingCompany = accountService.getDefault().landing_company_name;
        const isVirtual = clientService.isLandingCompanyOf('virtual', landingCompany);
        vm.receivedSettings = false;
        vm.options = _.merge(financialInformationOptions, accountOptions);
        vm.validation = validationService;
        vm.linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
        "en"}/terms-and-conditions.html`;
        vm.data = {
            salutation                          : '',
            first_name                          : '',
            last_name                           : '',
            date_of_birth                       : '',
            residence                           : '',
            place_of_birth                      : '',
            address_line_1                      : '',
            address_line_2                      : '',
            address_city                        : '',
            address_state                       : '',
            address_postcode                    : '',
            phone                               : '',
            forex_trading_experience            : '',
            forex_trading_frequency             : '',
            indices_trading_experience          : '',
            indices_trading_frequency           : '',
            commodities_trading_experience      : '',
            commodities_trading_frequency       : '',
            stocks_trading_experience           : '',
            stocks_trading_frequency            : '',
            other_derivatives_trading_experience: '',
            other_derivatives_trading_frequency : '',
            other_instruments_trading_experience: '',
            other_instruments_trading_frequency : '',
            employment_industry                 : '',
            occupation                          : '',
            education_level                     : '',
            income_source                       : '',
            net_income                          : '',
            estimated_worth                     : '',
            tax_residence                       : '',
            tax_identification_number           : '',
            account_turnover                    : '',
            account_opening_reason              : '',
            source_of_wealth                    : '',
            employment_status                   : ''
        };

        if (isVirtual) {
            vm.data.secret_question = '';
            vm.data.secret_answer = '';
        };

        const getPhoneCode = countryCode =>
            _.find(vm.residenceList, country => country.value === countryCode).phone_idd;

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
                vm.receivedSettings = true;
                _.forEach(vm.data, (val, k) => {
                    if (get_settings[k]) vm.data[k] = get_settings[k];
                });
                if (get_settings.date_of_birth) {
                    vm.data.date_of_birth = new Date(get_settings.date_of_birth * 1000);
                }
                if (get_settings.place_of_birth) {
                    vm.hasPOB = true;
                }
                if (get_settings.country_code) {
                    const countryCode = get_settings.country_code;
                    vm.hasResidence = true;
                    vm.data.residence = countryCode;
                    websocketService.sendRequestFor.statesListSend(countryCode);
                    if (!get_settings.phone) {
                        const phoneCode = getPhoneCode(countryCode);
                        vm.data.phone = phoneCode ? `+${phoneCode}` : '';
                    }
                }
                if (vm.data.tax_residence) {
                    vm.settingTaxResidence = _.words(vm.data.tax_residence);
                    vm.residenceList = _.map(vm.residenceList, res => {
                        if (vm.settingTaxResidence.indexOf(res.value) > -1) {
                            res.checked = true;
                        }
                        return res;
                    });
                    const checkedValues = _.filter(vm.residenceList, res => res.checked);
                    vm.selectedTaxResidencesName = _.map(checkedValues, value => value.text).join(', ');
                }
            });
        });

        vm.setTaxResidence = () => {
            vm.touchedTaxResidence = true;
            const checkedValues = _.filter(vm.residenceList, res => res.checked);
            vm.selectedTaxResidencesName = _.map(checkedValues, value => value.text).join(', ');
            vm.data.tax_residence = _.map(checkedValues, value => value.value).join(',');
            vm.closeModal();
        };

        vm.submitAccountOpening = () => {
            vm.disableUpdatebutton = true;
            vm.error = {};
            let params = _.clone(vm.data);
            params.accept_risk = vm.accept_risk ? 1 : 0;
            params.date_of_birth = vm.data.date_of_birth ? $filter("date")(vm.data.date_of_birth, "yyyy-MM-dd") : '';
            params = _.forEach(params, (val, k) => {
                params[k] = _.trim(val);
                return params[k];
            });
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
            const selectedAccount = new_account_maltainvest.oauth_token;
            websocketService.authenticate(selectedAccount);
            appStateService.newAccountAdded = true;
            accountService.addedAccount = selectedAccount;
        });

        vm.openTermsAndConditions = () =>
            window.open(vm.linkToTermAndConditions, "_blank");

        vm.init = () => {
            vm.error = {};
            websocketService.sendRequestFor.residenceListSend();
            vm.readOnly = !isVirtual;
        };

        vm.init();
    }
})();
