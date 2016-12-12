/**
 * @name settings controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 11/11/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.settings.controllers')
    .controller('SettingsController', Settings);

  Settings.$inject = ['appStateService'];

  function Settings(appStateService){
    var vm = this;

    vm.settings = [
      /*{
        name: "settings.security-and-limits",
        submenus: [
          {
            name: "settings.self-exclusion",
            url: "self-exclusion",
            scope: "admin",
            forRealAccount: true
          }
        ]
      },*/
      {
        name: "profile.personal_details",
        url: "profile",
        scope: "read",
        forRealAccount: false
      },
      {
        name: "settings.self-exclusion",
        url: "self-exclusion",
        scope: "admin",
        forRealAccount: true
      },
      {
        name: "menu.language",
        url: "language",
        scope: "read",
        forRealAccount: false
      }
    ];

    vm.checkScope = function(scope){
      // since users aren't able to sign-in by token scopes don't have meaning any more
      return true;
    }

    vm.checkAccount = function(forRealAccount){
      if(forRealAccount){
        return !appStateService.virtuality;
      }
      return true;
    }
  }
})();
