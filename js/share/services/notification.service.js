/**
 * @name notificationService
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/03/2017
 * @copyright Binary Ltd
 */

angular.module("binary").service("notificationService", function() {
	  this.notices = [];

    this.emptyNotices = () => {
		 this.notices = [];
    }

    this.messages = {
        authenticateMessage: {
            title: "account_authentication",
            text : "please_authenticate",
            link : "authentication"
        },
        ageVerificationMessage: {
            title: "account_age_verification",
            text : "needs_age_verification",
            link : "contact"
        },
        restrictedMessage: {
            title: "account_restriction",
            text : "please_contact",
            link : "contact"
        },
        countryNotSetMessage: {
            title: "account_country",
            text : "set_country",
            link : "profile"
        },
        riskAssessmentMessage: {
            title: "financial_assessment_not_completed",
            text : "complete_financial_assessment",
            link : "financial-assessment"
        },
        taxInformationMessage: {
            title: "tax_information",
            text : "complete_profile",
            link : "profile"
        },
        termsAndConditionsMessage: {
            title: "tnc",
            text : "accept_tnc",
            link : "terms-and-conditions"
        },
        maxTurnoverLimitNotSetMessage: {
            title: "max_turnover_limit",
            text : "set_max_turnover_limit",
            link : "self-exclusion"
        },
        currencyNotSetMessage: {
            title: "account_currency",
            text : "choose_account_currency",
            link : "set-currency"
        }
    }

});
