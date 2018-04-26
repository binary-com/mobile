/**
 * @name Check User Status controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 02/15/2017
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.check-user-status.controllers")
        .controller("CheckUserStatusController", CheckUserStatus);

    CheckUserStatus.$inject = [
        "$scope",
        "$translate",
        "$timeout",
        "websocketService",
        "appStateService",
        "accountService",
        "notificationService",
        "clientService"
    ];

    function CheckUserStatus(
        $scope,
        $translate,
        $timeout,
        websocketService,
        appStateService,
        accountService,
        notificationService,
        clientService
    ) {
        const vm = this;
        vm.isLoggedIn = false;
        vm.notUpdatedTaxInfo = false;
        vm.isMaltainvest = false;
        vm.isCostarica = false;
        vm.isMalta = false;
        vm.isIom = false;
        vm.isVirtual = false;
        vm.websiteTncStatus = '';
        vm.clientTncStatus = '';
        vm.notificationMessages = notificationService.messages;
        let currentAccount = {};
        let landingCompany = '';

        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        // check type of account
        vm.checkAccountType = function(landingCompany) {
            vm.isMaltainvest = isLandingCompanyOf('maltainvest', landingCompany);
            vm.isMalta = isLandingCompanyOf('malta', landingCompany);
            vm.isCostarica = isLandingCompanyOf('costarica', landingCompany);
            vm.isIom = isLandingCompanyOf('iom', landingCompany);
            vm.isVirtual = isLandingCompanyOf('virtual', landingCompany);
        };

        vm.getAccountInfo = function(landingCompany) {
            currentAccount = accountService.getDefault();
            if (currentAccount && _.keys(currentAccount).length) {
                vm.checkAccountType(landingCompany);
                websocketService.sendRequestFor.getAccountStatus();
                websocketService.sendRequestFor.getSelfExclusion();
                websocketService.sendRequestFor.accountSetting();
            } else {
                $timeout(vm.getAccountInfo, 1000);
            }
        };

        $scope.$on('mt5_login_list:success', (e, mt5_login_list) => {
            vm.mt5LoginList = mt5_login_list;
	          vm.financialAssessmentStatus(vm.status);
        });

        $scope.$on("authorize", (e, authorize) => {
            const currency = authorize.currency;
            vm.currencyStatus(currency);
            const accountList = authorize.account_list;
            const thisAccount = _.find(accountList, acc => acc.loginid === authorize.loginid);
            if (thisAccount.excluded_until && !appStateService.hasRestrictedMessage) {
                appStateService.hasRestrictedMessage = true;
                notificationService.notices.push(vm.notificationMessages.restrictedMessage);
            }

            if (!appStateService.checkedAccountStatus) {
                appStateService.checkedAccountStatus = true;
                vm.balance = authorize.balance;
                landingCompany = authorize.landing_company_name;
                vm.getAccountInfo(landingCompany);
            }
        });

        // in case the authorize response is passed before the execution of this controller
        vm.init = function() {
            if (appStateService.isLoggedin && !appStateService.checkedAccountStatus) {
                appStateService.checkedAccountStatus = true;
                vm.balance = sessionStorage.getItem("balance");
                landingCompany = localStorage.getItem('landingCompany');
                vm.getAccountInfo(landingCompany);
            }
        };

        vm.init();

        vm.financialAssessmentStatus = function(status) {
	          if (
                (status.risk_classification === "high" || vm.isMaltainvest || vm.mt5LoginList.length > 0) &&
                status.indexOf("financial_assessment_not_complete") > -1 &&
                !appStateService.hasFinancialAssessmentMessage && !vm.isVirtual
            ) {
                appStateService.hasFinancialAssessmentMessage = true;
                notificationService.notices.push(vm.notificationMessages.financialAssessmentMessage);
            }
        };

        vm.taxInformationStatus = function(status) {
            if (vm.isMaltainvest && status.indexOf("crs_tin_information") < 0 && !appStateService.hasTaxInfoMessage) {
                appStateService.hasTaxInfoMessage = true;
                notificationService.notices.push(vm.notificationMessages.taxInformationMessage);
            }
        };

        vm.termsAndConditionsStatus = () => {
            if (!appStateService.virtuality &&
              !appStateService.hasTnCMessage &&
              vm.clientTncStatus &&
              vm.websiteTncStatus &&
              vm.clientTncStatus !== vm.websiteTncStatus) {
                appStateService.hasTnCMessage = true;
                notificationService.notices.push(vm.notificationMessages.termsAndConditionsMessage);
                // we run the digest cycle to call $watch in notifications in this case
                // because it can be changed from BE anytime (User is subscribed to website status)
                $scope.$apply();
            }
        };

        vm.authenticateStatus = function(promptClientToAuthenticate) {
            if (promptClientToAuthenticate === 1 && !appStateService.hasAuthenticateMessage) {
	            appStateService.hasAuthenticateMessage = true;
	            notificationService.notices.push(vm.notificationMessages.authenticateMessage);
            }
        };

        vm.ageVerificationStatus = function(status) {
            vm.ageVerified = status.indexOf("age_verification") > -1;
            if (!vm.ageVerified && (vm.isMaltainvest || vm.isMalta || vm.isIom)) {
                if (!appStateService.hasAgeVerificationMessage) {
                    appStateService.hasAgeVerificationMessage = true;
                    notificationService.notices.push(vm.notificationMessages.ageVerificationMessage);
                }
            }
        };

        vm.unwelcomeStatus = function(status) {
            vm.unwelcomed = status.indexOf("unwelcome") > -1;
            if (vm.unwelcomed && (vm.isMalta || vm.isMaltainvest || vm.isIom || vm.isCostarica)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(vm.notificationMessages.restrictedMessage);
                }
            }
        };

        vm.cashierStatus = function(status) {
            vm.cashierLocked = status.indexOf("cashier_locked") > -1;
            if (vm.cashierLocked && (vm.isMalta || vm.isMaltainvest || vm.isIom || vm.isCostarica)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(vm.notificationMessages.restrictedMessage);
                }
            }
        };

        vm.withdrawalStatus = function(status) {
            vm.withdrawalLocked = status.indexOf("withdrawal_locked") > -1;
            if (vm.withdrawalLocked && (vm.isMalta || vm.isMaltainvest || vm.isIom || vm.isCostarica)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(vm.notificationMessages.restrictedMessage);
                }
            }
        };

        vm.maxTurnoverLimitStatus = function(get_self_exclusion) {
            vm.maxTurnoverLimitSet = get_self_exclusion.hasOwnProperty("max_30day_turnover");
            if (vm.isIom && !vm.maxTurnoverLimitSet && !appStateService.hasMaxTurnoverMessage) {
                appStateService.hasMaxTurnoverMessage = true;
                notificationService.notices.push(vm.notificationMessages.maxTurnoverLimitNotSetMessage);
            } else if (vm.isIom && vm.maxTurnoverLimitSet && appStateService.hasMaxTurnoverMessage) {
                // in update of self exclusion
                vm.reload();
            }
        };

        vm.residenceStatus = function(get_settings) {
            vm.countryCode = get_settings.country_code;
            if (vm.countryCode == null && appStateService.virtuality && !appStateService.hasCountryMessage) {
                appStateService.hasCountryMessage = true;
                notificationService.notices.push(vm.notificationMessages.countryNotSetMessage);
            }
        };

        vm.currencyStatus = function(currency) {
            if (currency === "" || currency === null || _.trim(currency).length === 0) {
            //    user has no currency
	            if (!appStateService.hasCurrencyMessage) {
		            appStateService.hasCurrencyMessage = true;
		            notificationService.notices.push(vm.notificationMessages.currencyNotSetMessage);
	            }
            }
        };

        $scope.$on("get_account_status", (e, get_account_status) => {
            if (get_account_status.hasOwnProperty("status")) {
                vm.status = get_account_status.status;
                vm.authenticateStatus(get_account_status.prompt_client_to_authenticate);
                vm.taxInformationStatus(vm.status);
                vm.ageVerificationStatus(vm.status);
                vm.unwelcomeStatus(vm.status);
                vm.cashierStatus(vm.status);
                vm.withdrawalStatus(vm.status);
                websocketService.sendRequestFor.mt5LoginList();
            }
        });

        // get terms and onditions
        $scope.$on("get_settings", (e, get_settings) => {
            if (get_settings) {
                vm.clientTncStatus = get_settings.client_tnc_status;
                vm.termsAndConditionsStatus();
                vm.residenceStatus(get_settings);
            }
        });

        $scope.$on('website_status', (e, website_status) => {
            if (website_status && vm.websiteTncStatus !== website_status.terms_conditions_version) {
                vm.websiteTncStatus = website_status.terms_conditions_version;
                vm.termsAndConditionsStatus();
            }
        });

        $scope.$on("get-self-exclusion", (e, get_self_exclusion) => {
            vm.maxTurnoverLimitStatus(get_self_exclusion);
        });

        //  reload on update
        $scope.$on("set-settings", (e, response) => {
            vm.reload();
        });

        $scope.$on("tnc_approval", (e, tnc_approval) => {
            if (tnc_approval === 1) {
                vm.reload();
            }
        });

        $scope.$on("set_financial_assessment:success", (e, set_financial_assessment) => {
            vm.reload();
        });

        $scope.$on("set_account_currency:success", (e, set_account_currency) => {
            vm.reload();
        });

        vm.reload = function() {
            appStateService.hasAuthenticateMessage = false;
            appStateService.hasRestrictedMessage = false;
            appStateService.hasMaxTurnoverMessage = false;
            appStateService.hasCountryMessage = false;
            appStateService.hasTnCMessage = false;
            appStateService.hasTaxInfoMessage = false;
            appStateService.hasFinancialAssessmentMessage = false;
            appStateService.hasAgeVerificationMessage = false;
            appStateService.hasCurrencyMessage = false;
            appStateService.checkedAccountStatus = false;
	          notificationService.emptyNotices();
            vm.getAccountInfo();
        };
    }
})();
