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
      var settings = {};
      config.wsUrl = settings.wsUrl = vm.wsUrl;
      config.app_id = settings.appId = vm.appId.toString();
      config.oauthUrl = settings.oauthUrl = vm.oauthUrl;

      localStorage.qaSettings = JSON.stringify(settings);

      websocketService.closeConnection();
      $state.go('home');
    }

    function init(){
      var settings = {};
      if(!_.isEmpty(localStorage.qaSettings)){
        settings = JSON.parse(localStorage.qaSettings);
      }

      vm.wsUrl = settings.wsUrl || config.wsUrl;
      vm.oauthUrl = settings.oauthUrl || config.oauthUrl;
      vm.appId = Number(settings.appId) || Number(config.app_id);
    }

    init();
  }
})();

