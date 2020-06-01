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
        "$state",
        "$filter",
        "$translate",
        "$ionicModal",
        "$ionicScrollDelegate",
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
        $state,
        $filter,
        $translate,
        $ionicModal,
        $ionicScrollDelegate,
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
        vm.hasCitizen = false;
        let modalIsSubmitted = false;
        vm.showRiskDisclaimer = false;
        vm.tncAccepted = false;
        let acceptRisk = 0;
        const landingCompany = accountService.getDefault().landing_company_name;
        const isVirtual = clientService.isLandingCompanyOf('virtual', landingCompany);
        const accounts = accountService.getAll();
        const upgradableLandingCompanies = appStateService.upgradeableLandingCompanies;
        vm.hasIOM = _.indexOf(upgradableLandingCompanies, 'iom') > -1 ||
            clientService.hasAccountOfLandingCompany(accounts, 'iom');
        vm.receivedSettings = false;
        vm.options = _.merge(financialInformationOptions, accountOptions);
        vm.validation = validationService;
        const linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
        "en"}/terms-and-conditions.html`;
        const linkToTINSite = 'https://ec.europa.eu/taxation_customs/tin/tinByCountry.html';
        vm.data = {
            salutation                          : '',
            first_name                          : '',
            last_name                           : '',
            date_of_birth                       : '',
            residence                           : '',
            place_of_birth                      : '',
            citizen                             : '',
            address_line_1                      : '',
            address_line_2                      : '',
            address_city                        : '',
            address_state                       : '',
            address_postcode                    : '',
            phone                               : '',
            forex_trading_experience            : '',
            forex_trading_frequency             : '',
            binary_options_trading_experience   : '',
            binary_options_trading_frequency    : '',
            cfd_trading_experience              : '',
            cfd_trading_frequency               : '',
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
            employment_status                   : '',
            client_type                         : ''
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
            if (vm.modalCtrl) {
                vm.modalCtrl.hide();
            }
        };

        $scope.$on('modal.hidden', () => {
            // check in modal close action to see if it's closed by submitting changes or not
            // if it's not saved, changes to popup state should not be saved too
            // not saving applies when user clicks outside popup to close popup either
            if (!modalIsSubmitted) {
                const taxResidence = _.split(vm.data.tax_residence, ',');
                _.filter(vm.residenceList, (residence, idx) => {
                    if (_.indexOf(taxResidence, residence.value) > -1) {
                        vm.residenceList[idx].checked = true;
                    } else {
                        vm.residenceList[idx].checked = false;
                    }
                });
            }
            modalIsSubmitted = false;
        });

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
                if (get_settings.citizen) {
                    vm.hasCitizen = true;
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
            params.client_type = vm.client_type ? 'professional' : 'retail';
            params.accept_risk = acceptRisk;
            params.date_of_birth = vm.data.date_of_birth ? $filter("date")(vm.data.date_of_birth, "yyyy-MM-dd") : '';
            params = _.forEach(params, (val, k) => {
                params[k] = _.trim(val);
                return params[k];
            });
            websocketService.sendRequestFor.createMaltainvestAccountSend(params);
        };

        vm.acceptRisk = () => {
            acceptRisk = 1;
            vm.submitAccountOpening();
        };

        vm.declineRisk = () => {
            acceptRisk = 0;
            $state.go('trade');
        }

        $scope.$on("new_account_maltainvest:error", (e, error) => {
            vm.disableUpdatebutton = false;
            if (error.hasOwnProperty("details")) {
                $scope.$apply(() => {
                    vm.errors = error.details;
                });
            } else if (error.code && error.code === 'show risk disclaimer') {
                $scope.$applyAsync(() => {
                    vm.showRiskDisclaimer = true;
                    $ionicScrollDelegate.scrollTop(true);
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on("new_account_maltainvest", (e, new_account_maltainvest) => {
            vm.disableUpdatebutton = false;
            const selectedAccount = new_account_maltainvest.oauth_token;
            appStateService.loginFinished = false;
            websocketService.authenticate(selectedAccount);
            appStateService.newAccountAdded = true;
            accountService.addedAccount = selectedAccount;
        });

        vm.openTermsAndConditions = () => {
            window.open(linkToTermAndConditions, "_system");
        }

        vm.openProfessionalClientInformation = () => {
            alertService.showProfessioanlClientInformation($scope);
        }

        vm.openPEPInformation = () => {
            alertService.showPEPInformation($scope);
        }

        vm.openTaxInformation = () => {
            alertService.showTaxInformation($scope);
        }

        vm.goToTINSite = () => {
            window.open(linkToTINSite, "_blank");
        }

        vm.showConfirmProfessionalClient = () => {
            if (vm.client_type) {
                alertService.displayProfessionalClientConfirmation(
                    $translate.instant('professional-client-confirmation.professional_clients'),
                    'information-popup',
                    $scope,
                    'js/share/templates/professional-client/professional-client-confirmation.template.html',
                    [
                        {
                            text : $translate.instant("professional-client-confirmation.decline"),
                            onTap: () => vm.client_type = 0
                        },
                        {
                            text : $translate.instant("professional-client-confirmation.accept"),
                            type : "button-positive",
                            onTap: () => true
                        }
                    ]
                );
            }
        }

        const init = () => {
            vm.error = {};
            websocketService.sendRequestFor.residenceListSend();
            vm.readOnly = !isVirtual;
        };

        init();
    }
})();
