// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

(function() {
    "use restrict";

    angular.module("binary", [
        "ionic",
        "ionic.native",
        "pascalprecht.translate",
        "hmTouchEvents",
        "ngIOS9UIWebViewPatch",
        "binary.share.components",
        "binary.share.services",
        "binary.pages",
        "ngMessages",
        "ngCordova"
    ]);

    angular.module("binary.share.components", [
        "binary.share.components.language",
        "binary.share.components.ping",
        "binary.share.components.accounts",
        "binary.share.components.spinner-logo",
        "binary.share.components.balance",
        "binary.share.components.long-press",
        "binary.share.components.reality-check",
        "binary.share.components.logout",
        "binary.share.components.connectivity",
        "binary.share.components.regex-validate",
        "binary.share.components.number",
        "binary.share.components.app-version",
        "binary.share.components.updater",
        "binary.share.components.check-user-status",
        "binary.share.components.service-outage",
        "binary.share.components.notification-icon",
        "binary.share.components.big-number",
        "binary.share.components.ios-pwa-prompt",
    ]);

    angular.module("binary.share.services", []);

    angular.module("binary.pages", [
        "binary.pages.home",
        "binary.pages.signin",
        "binary.pages.trade",
        "binary.pages.real-account-opening",
        "binary.pages.maltainvest-account-opening",
        "binary.pages.profit-table",
        "binary.pages.statement",
        "binary.pages.transaction-detail",
        "binary.pages.settings",
        "binary.pages.self-exclusion",
        "binary.pages.profile",
        "binary.pages.terms-and-conditions",
        "binary.pages.update",
        "binary.pages.change-password",
        "binary.pages.financial-assessment",
        "binary.pages.limits",
        "binary.pages.trading-times",
        "binary.pages.resources",
        "binary.pages.asset-index",
        "binary.pages.meta-trader",
        "binary.pages.authentication",
        "binary.pages.contact",
        "binary.pages.notifications",
        "binary.pages.set-currency",
        "binary.pages.accounts-management",
        "binary.pages.redirect",
        "binary.pages.account-categorisation"
    ]);

    String.prototype.capitalize = function() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };
})();
