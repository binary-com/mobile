// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

(function(){
  'use restrict';

  angular.module('binary', [
      'ionic',
      'pascalprecht.translate',
      'hmTouchEvents',
      'ngIOS9UIWebViewPatch',
      'binary.share.components',
      'binary.share.services',
      'binary.pages',
      'ngMessages'
      ]);

  angular
    .module('binary.share.components', [
        'binary.share.components.language',
        'binary.share.components.ping',
        'binary.share.components.accounts',
        'binary.share.components.spinner-logo',
        'binary.share.components.balance',
        'binary.share.components.reality-check',
        'binary.share.components.real-account-opening',
        'binary.share.components.manage-accounts'
    ]);

  angular
    .module('binary.share.services', []);

  angular
    .module('binary.pages', [
        'binary.pages.home',
        'binary.pages.signin',
        'binary.pages.help',
        'binary.pages.trade',
        'binary.pages.profit-table',
        'binary.pages.transaction-detail',
        'binary.pages.new-real-account-opening'
    ]);

  String.prototype.capitalize = function() {
      return this.charAt(0).toUpperCase() + this.slice(1);
  }

})();
