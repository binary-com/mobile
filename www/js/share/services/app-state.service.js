/**
 * @name appStateService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 05/02/2016
 * @copyright Binary Ltd
 * Keeping state of the app in this factory
 */

angular.module("binary").factory("appStateService", () => {
    const factory = {};
    factory.tradeMode = true;
    factory.purchaseMode = false;
    factory.isLoggedin = false;
    factory.scopes = [];
    factory.isChangedAccount = false;
    factory.isRealityChecked = false;
    factory.isPopupOpen = false;
    factory.isProfitTableSet = false;
    factory.profitTableRefresh = false;
    factory.isStatementSet = false;
    factory.statementRefresh = false;
    factory.virtuality = 0;
    factory.newAccountAdded = false;
    factory.isLanguageReady = false;
    factory.passwordChanged = false;
    factory.limitsChange = false;
    factory.realityCheckLogin = false;
    factory.hasAuthenticateMessage = false;
    factory.hasRestrictedMessage = false;
    factory.hasMaxTurnoverMessage = false;
    factory.hasCountryMessage = false;
    factory.hasTnCMessage = false;
    factory.hasTaxInfoMessage = false;
    factory.hasFinancialAssessmentMessage = false;
    factory.hasAgeVerificationMessage = false;
    factory.hasCurrencyMessage = false;
    factory.checkedAccountStatus = false;
    factory.siteStatus = "up";
    factory.modalIsOpen = false;
    factory.currenciesConfig = {};
    factory.balanceSubscribtionId = null;
    factory.accountCurrencyChanged = false;
    factory.selectedCurrency = false;
    factory.upgrade = {};
    factory.redirectedFromAccountsManagemenet = false;
    factory.checkingUpgradeDone = false;
    factory.upgradeableLandingCompanies = [];
    factory.loginFinished = false;
    factory.isMaltainvest = false;
    factory.authorizeToken = "";

    return factory;
});
