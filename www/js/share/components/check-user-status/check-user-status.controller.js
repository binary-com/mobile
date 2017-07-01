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
        "$state",
        "$translate",
        "$timeout",
        "websocketService",
        "appStateService",
        "accountService",
        "notificationService"
    ];

    function CheckUserStatus(
        $scope,
        $state,
        $translate,
        $timeout,
        websocketService,
        appStateService,
        accountService,
        notificationService
    ) {
        const vm = this;
        vm.isLoggedIn = false;
        vm.notUpdatedTaxInfo = false;
        vm.isFinancial = false;
        vm.hasHighRisk = false;
        // authentication and restricted messages
        $translate([
            "notifications.account_authentication",
            "notifications.please_authenticate",
            "notifications.account_age_verification",
            "notifications.needs_age_verification",
            "notifications.account_restriction",
            "notifications.please_contact",
            "notifications.set_country",
            "notifications.account_country",
            "notifications.financial_assessment_not_completed",
            "notifications.complete_financial_assessment",
            "notifications.tax_information",
            "notifications.complete_profile",
            "notifications.tnc",
            "notifications.accept_tnc",
            "notifications.max_turnover_limit",
            "notifications.set_max_turnover_limit"
        ]).then(translation => {
            vm.authenticateMessage = {
                title: translation["notifications.account_authentication"],
                text : translation["notifications.please_authenticate"],
                link : "authentication"
            };
            vm.ageVerificationMessage = {
                title: translation["notifications.account_age_verification"],
                text : translation["notifications.needs_age_verification"],
                link : "contact"
            };
            vm.restrictedMessage = {
                title: translation["notifications.account_restriction"],
                text : translation["notifications.please_contact"],
                link : "contact"
            };
            vm.countryNotSetMessage = {
                title: translation["notifications.account_country"],
                text : translation["notifications.set_country"],
                link : "profile"
            };
            vm.financialAssessmentMessage = {
                title: translation["notifications.financial_assessment_not_completed"],
                text : translation["notifications.complete_financial_assessment"],
                link : "financial-assessment"
            };
            vm.taxInformationMessage = {
                title: translation["notifications.tax_information"],
                text : translation["notifications.complete_profile"],
                link : "profile"
            };
            vm.termsAndConditionsMessage = {
                title: translation["notifications.tnc"],
                text : translation["notifications.accept_tnc"],
                link : "terms-and-conditions"
            };
            vm.maxTurnoverLimitNotSetMessage = {
                title: translation["notifications.max_turnover_limit"],
                text : translation["notifications.set_max_turnover_limit"],
                link : "self-exclusion"
            };
        });

        // check type of account
        vm.checkAccountType = function() {
            vm.account = accountService.getDefault();
            vm.isFinancial = !!_.startsWith(vm.account.id, "MF");
            vm.isCR = !!_.startsWith(vm.account.id, "CR");
            vm.isMLT = !!_.startsWith(vm.account.id, "MLT");
            vm.isMX = !!_.startsWith(vm.account.id, "MX");
        };

        vm.getAccountInfo = function() {
            if (localStorage.hasOwnProperty("accounts") && !_.isEmpty(localStorage.accounts)) {
                vm.checkAccountType();
                websocketService.sendRequestFor.getAccountStatus();
                websocketService.sendRequestFor.getFinancialAssessment();
                websocketService.sendRequestFor.mt5LoginList();
                websocketService.sendRequestFor.getSelfExclusion();
            } else {
                $timeout(vm.getAccountInfo, 1000);
            }
        };

        $scope.$on("authorize", (e, authorize) => {
            if (!appStateService.checkedAccountStatus) {
                notificationService.notices.length = 0;
                appStateService.checkedAccountStatus = true;
                vm.balance = authorize.balance;
                vm.getAccountInfo();
            }
        });

        // in case the authorize response is passed before the execution of this controller
        vm.init = function() {
            if (appStateService.isLoggedin && !appStateService.checkedAccountStatus) {
                notificationService.notices.length = 0;
                appStateService.checkedAccountStatus = true;
                vm.balance = sessionStorage.getItem("balance");
                vm.getAccountInfo();
            }
        };

        vm.init();

        vm.riskStatus = function(get_account_status) {
            if (get_account_status.risk_classification === "high" && !vm.isCR) {
                vm.hasHighRisk = true;
                websocketService.sendRequestFor.getFinancialAssessment();
            } else {
                vm.hasHighRisk = false;
            }
        };

        vm.financialAssessmentStatus = function(get_financial_assessment) {
            if (
                _.isEmpty(get_financial_assessment) &&
                vm.hasHighRisk &&
                !appStateService.hasFinancialAssessmentMessage
            ) {
                appStateService.hasFinancialAssessmentMessage = true;
                notificationService.notices.push(vm.financialAssessmentMessage);
            }
        };

        vm.taxInformationStatus = function(status) {
            if (vm.isFinancial && status.indexOf("crs_tin_information") < 0 && !appStateService.hasTaxInfoMessage) {
                appStateService.hasTaxInfoMessage = true;
                notificationService.notices.push(vm.taxInformationMessage);
            }
        };

        vm.termsAndConditionsStatus = function(get_settings) {
            if (get_settings) {
                vm.clientTncStatus = get_settings.client_tnc_status;
                vm.termsConditionsVersion = localStorage.getItem("termsConditionsVersion");
                if (
                    !appStateService.virtuality &&
                    vm.clientTncStatus !== vm.termsConditionsVersion &&
                    !appStateService.hasTnCMessage
                ) {
                    appStateService.hasTnCMessage = true;
                    notificationService.notices.push(vm.termsAndConditionsMessage);
                }
            }
        };

        vm.authenticateStatus = function(status) {
            vm.authenticated = status.indexOf("authenticated") > -1;
            if (
                !vm.authenticated &&
                (vm.isFinancial ||
                    ((vm.isCR && vm.balance >= 200) || localStorage.mt5LoginList.length > 0) ||
                    vm.isMLT ||
                    vm.isMX)
            ) {
                if (!appStateService.hasAuthenticateMessage) {
                    appStateService.hasAuthenticateMessage = true;
                    notificationService.notices.push(vm.authenticateMessage);
                }
            }
        };

        vm.ageVerificationStatus = function(status) {
            vm.ageVerified = status.indexOf("age_verification") > -1;
            if (!vm.ageVerified && (vm.isFinancial || vm.isMLT || vm.isMX)) {
                if (!appStateService.hasAgeVerificationMessage) {
                    appStateService.hasAgeVerificationMessage = true;
                    notificationService.notices.push(vm.ageVerificationMessage);
                }
            }
        };

        vm.unwelcomeStatus = function(status) {
            vm.unwelcomed = status.indexOf("unwelcome") > -1;
            if (vm.unwelcomed && (vm.isMLT || vm.isFinancial || vm.isMX || vm.isCR)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(vm.restrictedMessage);
                }
            }
        };

        vm.cashierStatus = function(status) {
            vm.cashierLocked = status.indexOf("cashier_locked") > -1;
            if (vm.cashierLocked && (vm.isMLT || vm.isFinancial || vm.isMX || vm.isCR)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(vm.restrictedMessage);
                }
            }
        };

        vm.withdrawalStatus = function(status) {
            vm.withdrawalLocked = status.indexOf("withdrawal_locked") > -1;
            if (vm.withdrawalLocked && (vm.isMLT || vm.isFinancial || vm.isMX || vm.isCR)) {
                if (!appStateService.hasRestrictedMessage) {
                    appStateService.hasRestrictedMessage = true;
                    notificationService.notices.push(vm.restrictedMessage);
                }
            }
        };

        vm.maxTurnoverLimitStatus = function(get_self_exclusion) {
            vm.maxTurnoverLimitSet = !!get_self_exclusion.hasOwnProperty("max_30day_turnover");
            if (vm.isMX && !vm.maxTurnoverLimitSet && !appStateService.hasMaxTurnoverMessage) {
                appStateService.hasMaxTurnoverMessage = true;
                notificationService.notices.push(vm.maxTurnoverLimitNotSetMessage);
            } else if (vm.isMX && vm.maxTurnoverLimitSet && appStateService.hasMaxTurnoverMessage) {
                // in update of self exclusion
                vm.reload();
            }
        };

        vm.residenceStatus = function(get_settings) {
            vm.countryCode = get_settings.country_code;
            if (vm.countryCode == null && appStateService.virtuality && !appStateService.hasCountryMessage) {
                appStateService.hasCountryMessage = true;
                notificationService.notices.push(vm.countryNotSetMessage);
            }
        };

        $scope.$on("get_account_status", (e, get_account_status) => {
            vm.riskStatus(get_account_status);
            if (get_account_status.hasOwnProperty("status")) {
                vm.taxInformationStatus(get_account_status.status);
                vm.authenticateStatus(get_account_status.status);
                vm.ageVerificationStatus(get_account_status.status);
                vm.unwelcomeStatus(get_account_status.status);
                vm.cashierStatus(get_account_status.status);
                vm.withdrawalStatus(get_account_status.status);
            }
        });

        // get the financial Assessment of user to check if is empty and user has high risk so must set them
        $scope.$on("get_financial_assessment:success", (e, get_financial_assessment) => {
            vm.financialAssessmentStatus(get_financial_assessment);
        });

        // get terms and onditions
        $scope.$on("get_settings", (e, get_settings) => {
            vm.termsAndConditionsStatus(get_settings);
            vm.residenceStatus(get_settings);
        });

        $scope.$on("get-self-exclusion", (e, get_self_exclusion) => {
            vm.maxTurnoverLimitStatus(get_self_exclusion);
        });

        //  reload on update
        $scope.$on("set-settings", (e, response) => {
            vm.reload();
        });

        $scope.$on("tnc_approval", (e, tnc_approval) => {
            if (tnc_approval == 1) {
                vm.reload();
            }
        });

        $scope.$on("set_financial_assessment:success", (e, set_financial_assessment) => {
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
            appStateService.checkedAccountStatus = false;
            notificationService.notices.length = 0;
            vm.getAccountInfo();
        };
    }
})();
