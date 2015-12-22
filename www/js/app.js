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
	.run(function($ionicPlatform){
		$ionicPlatform.ready(function() {
            if(typeof analytics !== undefined) {
                analytics.startTrackerWithId("UA-40877026-7");
            } else {
                console.log("Google Analytics Unavailable");
            }
        });
	});
