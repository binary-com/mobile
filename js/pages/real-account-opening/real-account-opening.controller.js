/**
 * @name new-account-real controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.real-account-opening").controller("RealAccountOpeningController", RealAccountOpening);

    RealAccountOpening.$inject = [
        "$scope",
        "$filter",
        "websocketService",
        "appStateService",
        "accountService",
        "alertService",
        "clientService",
        "validationService",
        "accountOptions"
    ];

    function RealAccountOpening(
        $scope,
        $filter,
        websocketService,
        appStateService,
        accountService,
        alertService,
        clientService,
        validationService,
        accountOptions
    ) {
        const vm = this;
        vm.data = {};
        vm.errors= {};
        const landingCompany = accountService.getDefault().landing_company_name;
        const isVirtual = clientService.isLandingCompanyOf('virtual', landingCompany);
        const accounts = accountService.getAll();
        const upgradableLandingCompanies = appStateService.upgradeableLandingCompanies;
        vm.hasIOM = _.indexOf(upgradableLandingCompanies, 'iom') > -1 ||
            clientService.hasAccountOfLandingCompany(accounts, 'iom');
        vm.requireCitizen = _.indexOf(upgradableLandingCompanies, 'malta') > -1 ||
            _.indexOf(upgradableLandingCompanies, 'iom') > -1;
        vm.validation = validationService;
        vm.options = accountOptions;
        vm.receivedSettings = false;
        vm.hasResidence = false;
        vm.hasPOB = false;
        vm.hasCitizen = false;
        vm.disableUpdatebutton = false;
        vm.linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
            "en"}/terms-and-conditions.html`;
        vm.data = {
            salutation            : '',
            first_name            : '',
            last_name             : '',
            date_of_birth         : '',
            citizen               : '',
            place_of_birth        : '',
            residence             : '',
            address_line_1        : '',
            address_line_2        : '',
            address_city          : '',
            address_state         : '',
            address_postcode      : '',
            phone                 : '',
            account_opening_reason: ''
        };

        if (isVirtual) {
            vm.data.secret_question = '';
            vm.data.secret_answer = '';
        };

        const getPhoneCode = countryCode =>
            _.find(vm.residenceList, country => country.value === countryCode).phone_idd;

        $scope.$on("residence_list", (e, residence_list) => {
            vm.residenceList = residence_list;
            websocketService.sendRequestFor.accountSetting();
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
            });
        });

        $scope.$on("states_list", (e, states_list) => {
            $scope.$applyAsync(() => {
                vm.statesList = states_list;
            });
        });

        vm.submitAccountOpening = () => {
            vm.disableUpdatebutton = true;
            vm.error = {};
            let params = _.clone(vm.data);
            const currency = appStateService.selectedCurrency || '';
            if (currency) {
                params.currency = currency;
            }
            params.date_of_birth = vm.data.date_of_birth ? $filter("date")(vm.data.date_of_birth, "yyyy-MM-dd") : '';
            params = _.forEach(params, (val, k) => {
                params[k] = _.trim(val);
                return params[k];
            });
            websocketService.sendRequestFor.createRealAccountSend(params);
        };

        // error handling by backend errors under each input
        $scope.$on("new_account_real:error", (e, error) => {
            vm.disableUpdatebutton = false;
            if (error.hasOwnProperty("details")) {
                $scope.$apply(() => {
                    vm.errors = error.details;
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on("new_account_real", (e, new_account_real) => {
            vm.disableUpdatebutton = false;
            const selectedAccount = new_account_real.oauth_token;
            appStateService.loginFinished = false;
            websocketService.authenticate(selectedAccount);
            appStateService.newAccountAdded = true;
            accountService.addedAccount = selectedAccount;
        });

        vm.openTermsAndConditions = () => {
            window.open(vm.linkToTermAndConditions, "_blank");
        }

        vm.openPEPInformation = () => {
            alertService.showPEPInformation($scope);
        }

        vm.init = () => {
            vm.errors = {};
            websocketService.sendRequestFor.residenceListSend();
            vm.readOnly = !isVirtual;
        };

        vm.init();
    }
})();
