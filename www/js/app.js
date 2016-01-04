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
	.run(function($ionicPlatform, $state, alertService){
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
        });
	});
