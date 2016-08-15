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
		function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
            $ionicConfigProvider.views.swipeBackEnabled(false);
			$stateProvider
				.state('home', {
					url: '/home',
                    cache: false,
					templateUrl: 'templates/pages/home.html',
					controller: 'HomeController'
				})
				.state('signin', {
					url: '/sign-in',
                    cache: false,
					templateUrl: 'templates/pages/sign-in.html',
					controller: 'SignInController'
				})
				.state('help', {
					url: '/help',
					templateUrl: 'templates/pages/help.html',
					controller: 'HelpController'
				})
				.state('trade', {
					url: '/trade',
					cache: false,
					templateUrl: 'templates/pages/trade.html',
					controller: 'TradeController'
				})
				.state('options', {
					url: '/options',
					cache: false,
					templateUrl: 'templates/pages/options.html',
					controller: 'OptionsController'
				})
				.state('accounts', {
					url: '/accounts',
					cache: false,
					templateUrl: 'templates/pages/accounts.html',
					controller: 'AccountsController'
				})
				.state('realaccountopening', {
									url: '/real-account-opening',
				                    cache: false,
									templateUrl: 'templates/pages/real-account-opening.html',
									controller: 'RealAccountOpeningController'
								})
                .state('redirect', {
                    url: '/redirect',
                    cache: false,
                    templateUrl: 'templates/pages/oauth-redirect.template.html',
                    controller: 'OAuthRedirect'
                });


				$urlRouterProvider.otherwise('/home');
		}
	);
