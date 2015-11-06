/**
 * @name states.config
 * @author Massih Hazrati
 * @contributors []
 * @since 11/4/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.config(
		function($stateProvider, $urlRouterProvider) {
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
				});

				$urlRouterProvider.otherwise('/sign-in');
		}
	);
