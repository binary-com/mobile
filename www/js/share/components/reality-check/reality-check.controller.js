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

        const setInSessions = (key, val) => sessionStorage.setItem(key, val);
        const getFromSessions = key => sessionStorage.getItem(key);
        const removeFromSessions = key => sessionStorage.removeItem(key);

        const hasRealityCheck = () => {
            // if not asked the interval from user and the start time of reality check popups are not set in sessionStorage
            if (!appStateService.isRealityChecked && _.isEmpty(sessionStorage._interval) === true) {
                realityCheck();
            } else if (!appStateService.isRealityChecked && !_.isEmpty(sessionStorage.start)) {
                // if not asked the interval from user and the start time of reality check popups are set in sessionStorage
                // happens when user refresh the browser
                appStateService.isRealityChecked = true;
                // calculate the difference between time of last popup and current time
                const timeGap = getFromSessions("start");
                const thisTime = new Date().getTime();
                // if the difference above is smaller than the interval set the period for popup timeout to remained time
                if (getFromSessions("_interval") * 60000 - (thisTime - timeGap) > 0) {
                    const period = getFromSessions("_interval") * 60000 - (thisTime - timeGap);
                    vm.realityCheckTimeout = $timeout(getRealityCheck, period);
                }
            } else if (!_.isEmpty(sessionStorage._interval)) { // if user did not refresh the app and the interval is set
                const period = getFromSessions("_interval") * 60000;
                vm.realityCheckTimeout = $timeout(getRealityCheck, period);
            }
        };

        const makePopupHidden = () => {
            $(".popup-container").removeClass("popup-showing");
            $("body").removeClass("popup-open");
            $(".backdrop").removeClass("visible");
        };

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
                        removeFromSessions('realityCheckStart')
                    }
                    if (!_.isEmpty(sessionStorage.start)) {
                        removeFromSessions('start');
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
                        removeFromSessions('realityCheckStart');
                    }
                    if (!_.isEmpty(sessionStorage.start)) {
                        removeFromSessions('start');
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
                        removeFromSessions('realityCheckStart');
                    }
                    if (!_.isEmpty(sessionStorage.start)) {
                        removeFromSessions('start');
                    }
                    appStateService.isRealityChecked = false;
                    landingCompanyName = authorize.landing_company_name;
                    websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
                    appStateService.isChangedAccount = false;
                }
            }
        });

        $scope.$on("landing_company_details", (e, landingCompanyDetails) => {
            if (landingCompanyDetails.has_reality_check === 1) hasRealityCheck();
        });

        const realityCheck = () => {
            appStateService.isRealityChecked = true;
            vm.data = {};
            vm.data.interval = 60;
            if (!appStateService.isPopupOpen) {
                appStateService.isPopupOpen = true;
                alertService.displayRealitCheckInterval(
                    $translate.instant("reality-check.title"),
                    "reality-check get-interval",
                    $scope,
                    "js/share/components/reality-check/interval-popup.template.html",
                    [
                        {
                            text: $translate.instant("reality-check.continue"),
                            type: "button-positive",
                            onTap(e) {
                                if (vm.data.interval <= 60 && vm.data.interval >= 10 && !vm.integerError) {
                                    setInSessions('_interval', vm.data.interval);
                                    vm.data.start_interval = new Date().getTime();
                                    setInSessions('start', vm.data.start_interval);
                                    hasRealityCheck();
                                    appStateService.isPopupOpen = false;
                                    setInSessions("realityCheckStart", Date.now());
                                } else {
                                    e.preventDefault();
                                }
                            }
                        }
                    ]
                );
            }
        };

        const getLastInterval = () => {
            removeFromSessions("_interval");
            setInSessions('_interval', vm.data.interval);
        };

        $scope.$on("reality_check", (e, reality_check) => {
            alertRealityCheck(reality_check);
        });

        const getRealityCheck = () => websocketService.sendRequestFor.realityCheck();

        const sessionTime = () => {
            vm.realityCheckItems.start_time = getFromSessions('realityCheckStart');
            vm.now = Date.now();
            const duration = vm.now - vm.realityCheckItems.start_time;
            vm.realityCheckItems.days = Math.floor(duration / 864e5);
            const hour = duration - vm.realityCheckItems.days * 864e5;
            vm.realityCheckItems.hours = Math.floor(hour / 36e5);
            const min = duration - (vm.realityCheckItems.days * 864e5 + vm.realityCheckItems.hours * 36e5);
            vm.realityCheckItems.minutes = Math.floor(min / 60000);
        };

        vm.logout = () => {
            alertService.confirmRemoveAllAccount(res => {
                if (typeof res !== "boolean") {
                    if (res === 1) res = true;
                    else res = false;
                }
                if (res) {
                    websocketService.logout();
                } else {
                    appStateService.isPopupOpen = false;
                    hasRealityCheck();
                }
            });
        };

        const alertRealityCheck = reality_check => {
            removeFromSessions("start");
            vm.realityCheckItems = reality_check;
            if (vm.sessionLoginId === vm.realityCheckItems.loginid && !appStateService.isPopupOpen) {
                sessionTime();
                vm.data = {};
                vm.data.interval = parseInt(getFromSessions("_interval"));
                $timeout.cancel(vm.realityCheckTimeout);
                appStateService.isPopupOpen = true;
                alertService.displayRealityCheckResult(
                    $translate.instant("reality-check.title"),
                    "reality-check result-popup",
                    $scope,
                    "js/share/components/reality-check/reality-check-result.template.html",
                    [
                        {
                            text: $translate.instant("reality-check.logout"),
                            type: "button-secondary",
                            onTap() {
                                vm.logout();
                            }
                        },
                        {
                            text: $translate.instant("reality-check.view_statement"),
                            type: "button-positive",
                            onTap(e) {
                                $state.go("statement");
                                makePopupHidden();
                                e.preventDefault();
                            }
                        },
                        {
                            text: $translate.instant("reality-check.continue"),
                            type: "button-positive",
                            onTap(e) {
                                if (vm.data.interval <= 60 && vm.data.interval >= 10 && !vm.integerError) {
                                    if (vm.sessionLoginId === vm.realityCheckItems.loginid) {
                                        getLastInterval(vm.data.interval);
                                        vm.data.start_interval = new Date().getTime();
                                        setInSessions('start', vm.data.start_interval);
                                        hasRealityCheck();
                                        appStateService.isPopupOpen = false;
                                    }
                                } else {
                                    e.preventDefault();
                                }
                            }
                        }
                    ]
                );
            }
        };

        $scope.$watch("vm.data.interval", () => {
            vm.integerError = appStateService.isPopupOpen &&
            !(Math.floor(vm.data.interval) === vm.data.interval && $.isNumeric(vm.data.interval));
        });

    }
})();
