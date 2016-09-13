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
          url: '/',
          cache: false,
					templateUrl: 'js/pages/home/home.template.html',
          controller: 'HomeController'
				})
        .state('layout', {
          cache: false,
          templateUrl: 'js/share/templates/layout/main-layout.template.html',
          abstract: true
        })
        .state('trade', {
          parent: 'layout',
          cache: false,
          controller: 'TradeController',
          controllerAs: 'vm',
          templateUrl: 'js/pages/trade/trade.template.html'
        })
        .state('signin', {
          templateUrl: 'js/pages/sign-in/sign-in.template.html',
          controller: 'SigninController',
          controllerAs: 'vm'
        })
        .state('help', {
          templateUrl: 'js/pages/help/help.template.html',
          controller: 'HelpController',
          controllerAs: 'vm'
        })
				.state('profittable',{
					parent: 'layout',
					cache: false,
					templateUrl: 'js/pages/profit-table/profit-table.template.html',
					controller: 'ProfitTableController',
					controllerAs: 'vm'
				})
				.state('statement',{
					parent: 'layout',
					cache: false,
					templateUrl: 'js/pages/statement/statement.template.html',
					controller: 'StatementController',
					controllerAs: 'vm'
				})
				.state('transactiondetail',{
					parent: 'layout',
					cache: false,
					templateUrl: 'js/pages/transaction-detail/transaction-detail.template.html',
					controller: 'TransactionDetailController',
					controllerAs: 'vm'
				})
				.state('realaccountopening',{
					parent: 'layout',
				  cache: false,
					templateUrl: 'js/pages/new-real-account-opening/new-real-account-opening.template.html',
					controller: 'NewRealAccountOpeningController',
					controllerAs: 'vm'
				})
				.state('manageaccounts',{
					parent: 'layout',
				  cache: false,
					templateUrl: 'js/share/components/manage-accounts/manage-accounts.template.html',
					controller: 'ManageAccountsController',
					controllerAs: 'vm'
				})
        .state('redirect', {
            url: '/redirect',
            cache: false,
            templateUrl: 'templates/pages/oauth-redirect.template.html',
            controller: 'OAuthRedirect'
        });


				$urlRouterProvider.otherwise('/');
		}
	);
