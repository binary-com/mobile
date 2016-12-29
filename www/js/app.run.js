(function(){
  'use strict';

  angular
    .module('binary')
    .run(function($rootScope, $ionicPlatform, $state, alertService, appStateService) {
      $ionicPlatform.ready(function() {

        if(window.cordova && window.cordova.plugins.backgroundMode){
          cordova.plugins.backgroundMode.setDefaults({
            title: 'Binary.com TickTrade',
            text: '',
            ticker: 'TickTrade is running in background',
            color: '#2A3052'
          });
          cordova.plugins.backgroundMode.enable();
        }

        if(typeof(window.ga) != "undefined"){
          window.ga.startTrackerWithId("UA-40877026-7");
        }
        else{
          console.log('Google Analytics is unavailable');
        }

        if(window.cordova && window.cordova.plugins.Keyboard) {
          // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
          // for form inputs)
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);

          // Don't remove this line unless you know what you are doing. It stops the viewport
          // from snapping when text inputs are focused. Ionic handles this internally for
          // a much nicer keyboard experience.
          cordova.plugins.Keyboard.disableScroll(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }

        // Handle the android's hardware button
        $ionicPlatform.registerBackButtonAction(function(){
          if(appStateService.isPopupOpen){
                    return;
          }
          else {
              if(["signin", "home", "update"].indexOf($state.current.name) > -1){
                  navigator.app.exitApp();
              }
              else if($state.current.name === "trade" && appStateService.purchaseMode){
                  return;
              }
              else if($state.current.name === "trade" && !appStateService.purchaseMode && !appStateService.tradeMode){
                  appStateService.tradeMode = true;
                  $rootScope.$broadcast('appState:tradeMode');
                  if(!$rootScope.$$phase){
                      $rootScope.$apply();
                  }
              }
              else if(['trade', 'profittable', 'statement'].indexOf($state.current.name) > -1){
                alertService.confirmExit(function(res){
                  if(res == 1){
                    sessionStorage.removeItem('start');
                    sessionStorage.removeItem('_interval');
                    navigator.app.exitApp();
                  }
                });
              }
              else{
                $state.goBack();
              }
          }

        }, 500);
      });
    });
})();
