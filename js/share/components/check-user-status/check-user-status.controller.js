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
        "$timeout",
        "websocketService",
        "appStateService",
        "accountService",
        "notificationService",
        "clientService"
    ];

    function CheckUserStatus(
        $scope,
        $timeout,
        websocketService,
        appStateService,
        accountService,
        notificationService,
        clientService
    ) {
        const vm = this;
        let isMaltainvest = false;
        let isCR = false;
        let isMalta = false;
        let isIom = false;
        let isVirtual = false;
        let websiteTncStatus = '';
        let clientTncStatus = '';
        let currentAccount = {};
        let mt5LoginList = [];
        let status = {};
        const notificationMessages = notificationService.messages;

        const isLandingCompanyOf = (targetLandingCompany, accountLandingCompany) =>
            clientService.isLandingCompanyOf(targetLandingCompany, accountLandingCompany);

        // check type of account
        const checkAccountType = landingCompany => {
            isMaltainvest = isLandingCompanyOf('maltainvest', landingCompany);
            isMalta = isLandingCompanyOf('malta', landingCompany);
            isCR = isLandingCompanyOf('costarica', landingCompany) || isLandingCompanyOf('svg', landingCompany);
            isIom = isLandingCompanyOf('iom', landingCompany);
            isVirtual = isLandingCompanyOf('virtual', landingCompany);
        };

        const getAccountInfo = () => {
            currentAccount = accountService.getDefault();
            if (!_.isEmpty(currentAccount) && appStateService.loginFinished) {
                currencyStatus(currentAccount.currency);
                checkAccountType(currentAccount.landingCompany);
                websocketService.sendRequestFor.getAccountStatus();
                websocketService.sendRequestFor.getSelfExclusion();
                websocketService.sendRequestFor.accountSetting();
                if (currentAccount.excluded_until && !appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(notificationMessages.restrictedMessage);
                }
            } else {
                $timeout(getAccountInfo, 1000);
            }
        };

        $scope.$on('mt5_login_list:success', (e, mt5_login_list) => {
            mt5LoginList = mt5_login_list;
            riskAssessmentStatus(status);
        });

        $scope.$on("authorize", (e, authorize) => {
            if (!appStateService.checkedAccountStatus) {
                init();
            }
        });

        // in case the authorize response is passed before the execution of this controller
        const init = () => {
            if (appStateService.isLoggedin && !appStateService.checkedAccountStatus) {
                appStateService.checkedAccountStatus = true;
                getAccountInfo();
            }
        };

        init();

        const riskAssessmentStatus = status => {
            const isHighRisk = status.risk_classification === "high";
            const hasRiskAssessment = isMaltainvest ?
                status.indexOf("financial_assessment_not_complete") > -1 ||
                status.indexOf("trading_experience_not_complete") : isHighRisk &&
                status.indexOf("financial_assessment_not_complete") > -1;
            const mt5HasRiskAssessment = mt5LoginList.length > 0 &&
                (status.indexOf("financial_assessment_not_complete") > -1 ||
                status.indexOf("trading_experience_not_complete"));
            if ((hasRiskAssessment || mt5HasRiskAssessment) && !appStateService.hasRiskAssessmentMessage) {
                appStateService.hasRiskAssessmentMessage = true;
                notificationService.notices.push(notificationMessages.riskAssessmentMessage);
            }
        };

        const taxInformationStatus = status => {
            if (isMaltainvest && status.indexOf("crs_tin_information") < 0 && !appStateService.hasTaxInfoMessage) {
                appStateService.hasTaxInfoMessage = true;
                notificationService.notices.push(notificationMessages.taxInformationMessage);
            }
        };

        const termsAndConditionsStatus = () => {
            if (!appStateService.virtuality &&
              !appStateService.hasTnCMessage &&
              clientTncStatus &&
              websiteTncStatus &&
              clientTncStatus !== websiteTncStatus) {
                appStateService.hasTnCMessage = true;
                notificationService.notices.push(notificationMessages.termsAndConditionsMessage);
                // we run the digest cycle to call $watch in notifications in this case
                // because it can be changed from BE anytime (User is subscribed to website status)
                $scope.$apply();
            }
        };

        const authenticateStatus = promptClientToAuthenticate => {
            if (promptClientToAuthenticate === 1 && !appStateService.hasAuthenticateMessage) {
	            appStateService.hasAuthenticateMessage = true;
	            notificationService.notices.push(notificationMessages.authenticateMessage);
            }
        };

        const ageVerificationStatus = status => {
            const ageVerified = status.indexOf("age_verification") > -1;
            if (!ageVerified && (isMaltainvest || isMalta || isIom)) {
                if (!appStateService.hasAgeVerificationMessage) {
                    appStateService.hasAgeVerificationMessage = true;
                    notificationService.notices.push(notificationMessages.ageVerificationMessage);
                }
            }
        };

        const unwelcomeStatus = status => {
            const unwelcomed = status.indexOf("unwelcome") > -1;
            if (unwelcomed && (isMalta || isMaltainvest || isIom || isCR)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(notificationMessages.restrictedMessage);
                }
            }
        };

        const cashierStatus = status => {
            const cashierLocked = status.indexOf("cashier_locked") > -1;
            if (cashierLocked && (isMalta || isMaltainvest || isIom || isCR)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(notificationMessages.restrictedMessage);
                }
            }
        };

        const withdrawalStatus = status => {
            const withdrawalLocked = status.indexOf("withdrawal_locked") > -1;
            if (withdrawalLocked && (isMalta || isMaltainvest || isIom || isCR)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(notificationMessages.restrictedMessage);
                }
            }
        };

        const maxTurnoverLimitStatus = get_self_exclusion => {
            const maxTurnoverLimitSet = get_self_exclusion.hasOwnProperty("max_30day_turnover");
            if (isIom && !maxTurnoverLimitSet && !appStateService.hasMaxTurnoverMessage) {
                appStateService.hasMaxTurnoverMessage = true;
                notificationService.notices.push(notificationMessages.maxTurnoverLimitNotSetMessage);
            } else if (isIom && maxTurnoverLimitSet && appStateService.hasMaxTurnoverMessage) {
                // in update of self exclusion
                reload();
            }
        };

        const residenceStatus = get_settings => {
            const countryCode = get_settings.country_code;
            if (countryCode == null && appStateService.virtuality && !appStateService.hasCountryMessage) {
                appStateService.hasCountryMessage = true;
                notificationService.notices.push(notificationMessages.countryNotSetMessage);
            }
        };

        const currencyStatus = currency => {
            if (currency === "" || currency === null || _.trim(currency).length === 0) {
            //    user has no currency
	            if (!appStateService.hasCurrencyMessage) {
		            appStateService.hasCurrencyMessage = true;
		            notificationService.notices.push(notificationMessages.currencyNotSetMessage);
	            }
            }
        };

        $scope.$on("get_account_status", (e, get_account_status) => {
            if (get_account_status.hasOwnProperty("status")) {
                status = get_account_status.status;
                authenticateStatus(get_account_status.prompt_client_to_authenticate);
                taxInformationStatus(status);
                ageVerificationStatus(status);
                unwelcomeStatus(status);
                cashierStatus(status);
                withdrawalStatus(status);
                websocketService.sendRequestFor.mt5LoginList();
            }
        });

        // get terms and onditions
        $scope.$on("get_settings", (e, get_settings) => {
            if (get_settings) {
                clientTncStatus = get_settings.client_tnc_status;
                termsAndConditionsStatus();
                residenceStatus(get_settings);
            }
        });

        $scope.$on('website_status', (e, website_status) => {
            if (website_status && websiteTncStatus !== website_status.terms_conditions_version) {
                websiteTncStatus = website_status.terms_conditions_version;
                termsAndConditionsStatus();
            }
        });

        $scope.$on("get-self-exclusion", (e, get_self_exclusion) => {
            maxTurnoverLimitStatus(get_self_exclusion);
        });

        //  reload on update
        $scope.$on("set-settings", (e, response) => {
            reload();
        });

        $scope.$on("tnc_approval", (e, tnc_approval) => {
            if (tnc_approval === 1) {
                reload();
            }
        });

        $scope.$on("set_financial_assessment:success", (e, set_financial_assessment) => {
            reload();
        });

        $scope.$on("currency:changed", () => {
            reload();
        });

        const reload = () => {
            appStateService.hasAuthenticateMessage = false;
            appStateService.hasRestrictedMessage = false;
            appStateService.hasMaxTurnoverMessage = false;
            appStateService.hasCountryMessage = false;
            appStateService.hasTnCMessage = false;
            appStateService.hasTaxInfoMessage = false;
            appStateService.hasRiskAssessmentMessage = false;
            appStateService.hasAgeVerificationMessage = false;
            appStateService.hasCurrencyMessage = false;
            appStateService.checkedAccountStatus = false;
	        notificationService.emptyNotices();
            init();
        };
    }
})();
