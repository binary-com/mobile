/**
 * @name Binary Module
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * The main module of binary app
 */

angular.module('binary', ['ionic', 'pascalprecht.translate'])

.config(['$translateProvider',
	function($translateProvider) {
		$translateProvider.preferredLanguage('en');
		$translateProvider.useStaticFilesLoader({
			prefix: '/i18n/',
			suffix: '.json'
		});
	}
])

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
    .state('accounts', {
      url: '/accounts',
      templateUrl: 'templates/accounts.html',
      controller: 'AccountsController'
    })
    .state('contract', {
      url: '/contract',
      templateUrl: 'templates/contract.html',
      controller: 'ContractController'
    });


   $urlRouterProvider.otherwise('/sign-in');
});
