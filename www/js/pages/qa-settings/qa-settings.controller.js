/**
 * @name qa-settings controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 10/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.qa-settings.controllers')
    .controller('QASettingsController', QASettings);

  QASettings.$inject = ['$state', 'appStateService',
                        'config', 'websocketService'];

  function QASettings($state, appStateService,
                      config, websocketService){
    var vm = this;

    vm.saveSettings = function(){
      config.wsUrl = localStorage.wsUrl = vm.wsUrl;
      config.app_id = localStorage.appId = vm.appId;
      websocketService.closeConnection();
      $state.go('home');
    }

    function init(){
      vm.wsUrl = localStorage.wsUrl || "wss://ws.binaryws.com/websockets/v3";
      vm.appId = Number(localStorage.appId) || 10;
    }

    init();
  }
})();

