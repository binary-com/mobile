/**
 * @name Binary Module
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * The main module of binary app
 */

angular.module('binary', ['ionic', 'pascalprecht.translate', 'hmTouchEvents', 'ngIOS9UIWebViewPatch']);


angular
.module('binary')
.run(function($rootScope, $ionicPlatform, $state, alertService, accountService, appStateService, $location){
    $ionicPlatform.ready(function() {

        // Add device information to Trackjs
        var deviceInfo = ionic.Platform.device();
        if(! jQuery.isEmptyObject(deviceInfo)){
            window.trackJs.addMetadata("Platform", deviceInfo.platform);
            window.trackJs.addMetadata("Version", deviceInfo.version);
            window.trackJs.addMetadata("Model", deviceInfo.model);
            window.trackJs.addMetadata("Manufacturer", deviceInfo.manufacturer);
            window.trackJs.addMetadata("IsVritual", deviceInfo.isVirtual);
            window.trackJs.addMetadata("Cordova", deviceInfo.cordova);
        }

        // Setup Google Analytics
        if(typeof analytics !== "undefined") {
            analytics.startTrackerWithId("UA-40877026-7");
        } else {
            console.log("Google Analytics Unavailable");
        }

        // Handle the android's hardware button
        $ionicPlatform.registerBackButtonAction(function(){
            if($state.current.name === "options"){
                alertService.confirmExit(function(res){
                    if(res == 1)
                        navigator.app.exitApp();
                });
            }
            else if($state.current.name === "signin" || $state.current.name === "home" ){
                navigator.app.exitApp();
            }
            else if($state.current.name === "trade" && appStateService.purchaseMode){
                return;
            }
            else if($state.current.name === "trade" && !appStateService.purchaseMode && !appStateService.tradeMode){
                appStateService.tradeMode = true;
                if(!$rootScope.$$phase){
                    $rootScope.$apply();
                }
            }
            else{
                navigator.app.backHistory();
            }
        }, 100);

        var handleUnloggedinUser = function(){
            var isRedirect = /#\/redirect\?/.exec(window.location.hash);
            if(!accountService.getDefault() && !isRedirect){
                $state.go('signin');
            }
        }

        handleUnloggedinUser();
        // Redirecting to the login page if there is not any default token
        $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    if(toState.name != "signin" && toState.name != "help" && toState.name != "redirect" && ! accountService.getDefault()){
                        event.preventDefault();
                        $state.go('signin');
                    }
                }
                );

    });
});
