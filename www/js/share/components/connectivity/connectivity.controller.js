/**
 * @name Connectivity Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 10/22/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.connectivity.controllers')
    .controller('ConnectivityController', Connectivity);

  Connectivity.$inject = ['$scope', '$state', '$cordovaNetwork'];

  function Connectivity($scope, $state, $cordovaNetwork){
    var vm = this;

    vm.isOffline = function(){
      if(ionic.Platform.isWebView()){
        return !$cordovaNetwork.isOnline();
      }
      else {
        !navigator.onLine;
      }
    };

    vm.isOnline = function(){
      if(ionic.Platform.isWebView()){
        return $cordovaNetwork.isOnline();
      }
      else {
        return navigator.onLine;
      }
    };

    function startWatchingNetwork(){
      if(ionic.Platform.isWebView()){
        $scope.$on('$cordovaNetwork:online', (e, networkState) => {
          $state.go('home');
        });

        $scope.$on('$cordovaNetwork:offline', (e, netwrorkState) => {
          $state.go('no-connection');
        });
      }
      else {
        window.addEventListener('online', function(e){
          $state.go('home');
        }, false);

        window.addEventListener('offline', function(e){
          $state.go('no-connection');
        }, false);
      }
    }

    function init(){
      startWatchingNetwork();
    }

    $scope.$on('$stateChangeSuccess', (e, current)=>{
        if(!vm.isOnline()){
          $state.go('no-connection');
        }
    });

    init();
  }
})();
