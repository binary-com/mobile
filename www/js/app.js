/**
 * @name Binary Module
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * The main module of binary app
 */

angular.module('binary', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInController'
    })
    .state('help', {
      url: '/help',
      templateUrl: 'templates/help.html',
      controller: 'HelpController'
    })
    .state('trade', {
      url: '/trade',
      templateUrl: 'templates/trade.html',
      controller: 'TradeController'
    })
    .state('options', {
      url: '/options',
      templateUrl: 'templates/options.html',
      controller: 'OptionsController'
    })
    .state('contract', {
      url: '/contract',
      templateUrl: 'templates/contract.html',
      controller: 'ContractController'
    });


   $urlRouterProvider.otherwise('/sign-in');
});
