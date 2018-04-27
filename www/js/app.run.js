(function() {
    angular.module("binary").run(($rootScope, $ionicPlatform, $state, alertService, appStateService) => {
        $ionicPlatform.ready(() => {
            if (ionic.Platform.isIOS()) {
                setTimeout(() => {
                    navigator.splashscreen.hide();
                }, 3000 - 1000);
            }

            if (window.cordova && window.cordova.plugins.backgroundMode) {
                cordova.plugins.backgroundMode.setDefaults({
                    title : "Binary.com TickTrade",
                    text  : "",
                    ticker: "TickTrade is running in background",
                    color : "#2A3052"
                });
                cordova.plugins.backgroundMode.enable();
            }

            if (typeof window.ga !== "undefined") {
                window.ga.startTrackerWithId("UA-40877026-7");
            } else {
                // eslint-disable-next-line
                console.log("Google Analytics is unavailable");
            }

            if (window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.cordova) {
                window.open = cordova.InAppBrowser.open;
            }

            // Handle the android's hardware button
            $ionicPlatform.registerBackButtonAction(() => {
                if (appStateService.isPopupOpen || appStateService.modalIsOpen) {
                    // Do nothing
                } else if (["signin", "home", "update"].indexOf($state.current.name) > -1) {
                    navigator.app.exitApp();
                } else if ($state.current.name === "trade" && appStateService.purchaseMode) {
                    // Do nothing
                } else if (
                    $state.current.name === "trade" &&
                    !appStateService.purchaseMode &&
                    !appStateService.tradeMode
                ) {
                    appStateService.tradeMode = true;
                    $rootScope.$broadcast("appState:tradeMode");
                    if (!$rootScope.$$phase) {
                        $rootScope.$apply();
                    }
                } else if (["trade", "profittable", "statement"].indexOf($state.current.name) > -1) {
                    alertService.confirmExit(res => {
                        if (res === 1) {
                            sessionStorage.removeItem("start");
                            sessionStorage.removeItem("_interval");
                            navigator.app.exitApp();
                        }
                    });
                } else if ($state.current.detailed) {
                    $state.go("trade");
                } else {
                    $state.goBack();
                }
            }, 500);
        });
    });
})();
