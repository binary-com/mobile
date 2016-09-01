/**
 * @name help module
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.help.controllers')
    .controller('HelpController', Help);

  Help.$inject = ['$state', 'analyticsService', 'languageService'];

  function Help($state, analyticsService, languageService){
    var vm = this;
    var language = languageService.read();
    vm.tokenUrl = "https://www.binary.com/" + language.toLowerCase() +"/user/settings/api_tokenws.html";

    analyticsService.google.trackView("Help");

    vm.backToSignInPage = function() {
      $state.go('signin');
    };

    vm.openExternal = function($event){
      window.open($event.currentTarget.href, "_system");
      return false;
    }
  }
})();
