/**
 * @name reality-check controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.reality-check.controllers")
        .controller("RealityCheckController", RealityCheck);

    RealityCheck.$inject = [
        "$scope",
        "$timeout",
        "$translate",
        "$state",
        "websocketService",
        "appStateService",
        "alertService"
    ];

    function RealityCheck($scope, $timeout, $translate, $state, websocketService, appStateService, alertService) {
        const vm = this;
        let landingCompanyName;
        vm.integerError = false;

        $scope.$on("authorize", (e, authorize) => {
            vm.sessionLoginId = authorize.loginid;
            if (!appStateService.realityCheckLogin) {
                appStateService.realityCheckLogin = true;
                // check if user is not already authorized, account is real money account  & is not changed in app
                if (
                    !appStateService.isRealityChecked &&
                    authorize.is_virtual === 0 &&
                    !appStateService.isChangedAccount
                ) {
                    landingCompanyName = authorize.landing_company_name;
                    websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
                } else if (
                    appStateService.isRealityChecked &&
                    appStateService.isChangedAccount &&
                    authorize.is_virtual === 1
                ) {
                    // check if user is already authorized, account changed and is virtual money account
                    $timeout.cancel(vm.realityCheckTimeout);
                    appStateService.isChangedAccount = false;
                    appStateService.isRealityChecked = true;
                    if (!_.isEmpty(sessionStorage.realityCheckStart)) {
                        sessionStorage.removeItem("realityCheckStart");
                    }
                    if (!_.isEmpty(sessionStorage.start)) {
                        sessionStorage.removeItem("start");
                    }
                } else if (
                    appStateService.isRealityChecked &&
                    appStateService.isChangedAccount &&
                    authorize.is_virtual === 0
                ) {
                    // check if account is changed and is real money account
                    if (vm.realityCheckTimeout) {
                        $timeout.cancel(vm.realityCheckTimeout);
                    }
                    if (!_.isEmpty(sessionStorage.realityCheckStart)) {
                        sessionStorage.removeItem("realityCheckStart");
                    }
                    if (!_.isEmpty(sessionStorage.start)) {
                        sessionStorage.removeItem("start");
                    }
                    appStateService.isRealityChecked = false;
                    landingCompanyName = authorize.landing_company_name;
                    websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
                    appStateService.isChangedAccount = false;
                } else if (
                    !appStateService.isRealityChecked &&
                    appStateService.isChangedAccount &&
                    authorize.is_virtual === 0
                ) {
                    if (vm.realityCheckTimeout) {
                        $timeout.cancel(vm.realityCheckTimeout);
                    }
                    if (!_.isEmpty(sessionStorage.realityCheckStart)) {
                        sessionStorage.removeItem("realityCheckStart");
                    }
                    if (!_.isEmpty(sessionStorage.start)) {
                        sessionStorage.removeItem("start");
                    }
                    appStateService.isRealityChecked = false;
                    landingCompanyName = authorize.landing_company_name;
                    websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
                    appStateService.isChangedAccount = false;
                }
            }
        });

        $scope.$on("landing_company_details", (e, landingCompanyDetails) => {
            if (landingCompanyDetails.has_reality_check === 1) {
                vm.hasRealityCheck();
            }
        });

        vm.setInterval = function setInterval(val) {
            const set = sessionStorage.setItem("_interval", val);
        };
        vm.setStart = function setInterval(val) {
            const set = sessionStorage.setItem("start", val);
        };

        vm.getInterval = function(key) {
            return sessionStorage.getItem(key);
        };
        vm.getStart = function(key) {
            return sessionStorage.getItem(key);
        };

        vm.removeInterval = function(key) {
            const remove = sessionStorage.removeItem(key);
        };
        vm.removeStart = function(key) {
            const remove = sessionStorage.removeItem(key);
        };

        vm.hasRealityCheck = function() {
            // if not asked the interval from user and the start time of reality check popups are not set in sessionStorage
            if (!appStateService.isRealityChecked && _.isEmpty(sessionStorage._interval) === true) {
                vm.realityCheck();
            } else if (!appStateService.isRealityChecked && !_.isEmpty(sessionStorage.start)) {
                // if not asked the interval from user and the start time of reality check popups are set in sessionStorage
                // happens when user refresh the browser
                appStateService.isRealityChecked = true;
                // calculate the difference between time of last popup and current time
                const timeGap = vm.getStart("start");
                const thisTime = new Date().getTime();
                // if the difference above is smaller than the interval set the period for popup timeout to remained time
                if (vm.getInterval("_interval") * 60000 - (thisTime - timeGap) > 0) {
                    const period = vm.getInterval("_interval") * 60000 - (thisTime - timeGap);
                    vm.realityCheckTimeout = $timeout(vm.getRealityCheck, period);
                }
            } else if (_.isEmpty(sessionStorage._interval) === false) { // if user did not refresh the app and the interval is set
                const period = vm.getInterval("_interval") * 60000;
                vm.realityCheckTimeout = $timeout(vm.getRealityCheck, period);
            }
        };

        vm.realityCheck = function() {
            appStateService.isRealityChecked = true;
            vm.data = {};
            vm.data.interval = 60;
            if (!appStateService.isPopupOpen) {
                appStateService.isPopupOpen = true;
                $translate(["reality-check.continue", "reality-check.title"]).then(translation => {
                    alertService.displayRealitCheckInterval(
                        translation["reality-check.title"],
                        "realitycheck getinterval",
                        $scope,
                        "js/share/components/reality-check/interval-popup.template.html",
                        [
                            {
                                text: translation["reality-check.continue"],
                                type: "button-positive",
                                onTap(e) {
                                    if (vm.data.interval <= 60 && vm.data.interval >= 10 && !vm.integerError) {
                                        vm.setInterval(vm.data.interval);
                                        vm.data.start_interval = new Date().getTime();
                                        vm.setStart(vm.data.start_interval);
                                        vm.hasRealityCheck();
                                        appStateService.isPopupOpen = false;
                                        sessionStorage.setItem("realityCheckStart", Date.now());
                                    } else {
                                        e.preventDefault();
                                    }
                                }
                            }
                        ]
                    );
                });
            }
        };

        vm.getLastInterval = function() {
            vm.removeInterval("_interval");
            vm.setInterval(vm.data.interval);
        };

        $scope.$on("reality_check", (e, reality_check) => {
            vm.alertRealityCheck(reality_check);
        });

        vm.getRealityCheck = function() {
            websocketService.sendRequestFor.realityCheck();
        };
        vm.sessionTime = function(reality_check) {
            vm.realityCheckitems.start_time = sessionStorage.getItem("realityCheckStart");
            vm.now = Date.now();
            vm.duration = vm.now - vm.realityCheckitems.start_time;
            vm.realityCheckitems.days = Math.floor(vm.duration / 864e5);
            vm.hour = vm.duration - vm.realityCheckitems.days * 864e5;
            vm.realityCheckitems.hours = Math.floor(vm.hour / 36e5);
            vm.min = vm.duration - (vm.realityCheckitems.days * 864e5 + vm.realityCheckitems.hours * 36e5);
            vm.realityCheckitems.minutes = Math.floor(vm.min / 60000);
        };

        vm.logout = function() {
            alertService.confirmRemoveAllAccount(res => {
                if (typeof res !== "boolean") {
                    if (res === 1) res = true;
                    else res = false;
                }

                if (res) {
                    websocketService.logout();
                }
                if (!res) {
                    vm.hasRealityCheck();
                }
            });
        };

        vm.alertRealityCheck = function(reality_check) {
            vm.removeStart("start");
            vm.realityCheckitems = reality_check;
            if (vm.sessionLoginId === vm.realityCheckitems.loginid && !appStateService.isPopupOpen) {
                vm.sessionTime(reality_check);
                vm.data = {};
                vm.data.interval = parseInt(vm.getInterval("_interval"));
                $timeout.cancel(vm.realityCheckTimeout);
                appStateService.isPopupOpen = true;
                $translate([
                    "reality-check.title",
                    "reality-check.continue",
                    "reality-check.logout",
                    "reality-check.view_statement"
                ]).then(translation => {
                    alertService.displayRealityCheckResult(
                        translation["reality-check.title"],
                        "realitycheck result-popup",
                        $scope,
                        "js/share/components/reality-check/reality-check-result.template.html",
                        [
                            {
                                text: translation["reality-check.logout"],
                                type: "button-secondary",
                                onTap() {
                                    vm.logout();
                                }
                            },
                            {
                                text: translation["reality-check.view_statement"],
                                type: "button-positive",
                                onTap(e) {
                                    $state.go("statement");
                                    $(".popup-container").removeClass("popup-showing");
                                    $("body").removeClass("popup-open");
                                    $(".backdrop").removeClass("visible");
                                    e.preventDefault();
                                }
                            },
                            {
                                text: translation["reality-check.continue"],
                                type: "button-positive",
                                onTap(e) {
                                    if (vm.data.interval <= 60 && vm.data.interval >= 10 && !vm.integerError) {
                                        if (vm.sessionLoginId === vm.realityCheckitems.loginid) {
                                            vm.getLastInterval(vm.data.interval);
                                            vm.data.start_interval = new Date().getTime();
                                            vm.setStart(vm.data.start_interval);
                                            vm.hasRealityCheck();
                                            appStateService.isPopupOpen = false;
                                        }
                                    } else {
                                        e.preventDefault();
                                    }
                                }
                            }
                        ]
                    );
                });
            }
        };

        $scope.$watch("vm.data.interval", () => {
            if (
                appStateService.isPopupOpen &&
                !(Math.floor(vm.data.interval) === vm.data.interval && $.isNumeric(vm.data.interval))
            ) {
                vm.integerError = true;
            } else {
                vm.integerError = false;
            }
        });
    }
})();
