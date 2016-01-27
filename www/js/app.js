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
.run(function($rootScope, $ionicPlatform, $state, alertService, accountService){
    $ionicPlatform.ready(function() {

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
            else{
                navigator.app.backHistory();
            }
        }, 100);

        // Redirecting to the login page if there is not any default token
        $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams){
                    if(toState.name != "signin" && toState.name != "help" && ! accountService.getDefault()){
                        event.preventDefault();
                        $state.go('signin');
                    }
                }
                );

        // Use codepush to check new update and install it.
        $ionicPlatform.ready(function(){
            codePush.sync(
                    function (syncStatus) {
                        switch (syncStatus) {
                            // Result (final) statuses
                            case SyncStatus.UPDATE_INSTALLED:
                                alertService.displayAlert("Update","The update was installed successfully.");
                                break;
                            case SyncStatus.UP_TO_DATE:
                                console.log("The application is up to date.");
                                break;
                            case SyncStatus.UPDATE_IGNORED:
                                alertService.displayAlert("Update","The user decided not to install the optional update.");
                                break;
                            case SyncStatus.ERROR:
                                alertService.displayAlert("Update","An error occured while checking for updates");
                                break;

                                // Intermediate (non final) statuses
                            case SyncStatus.CHECKING_FOR_UPDATE:
                                console.log("Checking for update.");
                                break;
                            case SyncStatus.AWAITING_USER_ACTION:
                                console.log("Alerting user.");
                                break;
                            case SyncStatus.DOWNLOADING_PACKAGE:
                                console.log("Downloading package.");
                                break;
                            case SyncStatus.INSTALLING_UPDATE:
                                console.log("Installing update");
                                break;
                        }
                    },
            {
                installMode: InstallMode.IMMEDIATE, updateDialog: true
            },
            function (downloadProgress) {
                console.log("Downloading " + downloadProgress.receivedBytes + " of " + downloadProgress.totalBytes + " bytes.");
            }
            );
        });
    });
});
