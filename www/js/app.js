angular.module('binary', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })
    .state('forgotpassword', {
      url: '/forgot-password',
      templateUrl: 'templates/forgot-password.html'
    })
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })
    .state('tabs.trade', {
      url: '/trade',
      views: {
        'trade-tab': {
          templateUrl: 'templates/trade.html',
          controller: 'TradeTabCtrl'
        }
      }
    })
    .state('tabs.account', {
      url: '/account',
      views: {
        'account-tab': {
          templateUrl: 'templates/account.html',
          controller: 'AccountTabCtrl'
        }
      }
    })
    .state('tabs.options', {
      url: '/options',
      views: {
        'options-tab': {
          templateUrl: 'templates/options.html',
          controller: 'OptionsTabCtrl'
        }
      }
    })

    .state('tabs.navstack', {
      url: '/navstack',
      views: {
        'about-tab': {
          templateUrl: 'templates/nav-stack.html'
        }
      }
    });


   $urlRouterProvider.otherwise('/sign-in');

})

.controller('SignInCtrl', function($scope, $state) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('tabs.trade');
  };

})

.controller('TradeTabCtrl', function($scope) {
  console.log('TradeTabCtrl');
})

.controller('AccountTabCtrl', function($scope) {
  console.log('AccountTabCtrl');
})

.controller('OptionsTabCtrl', function($scope) {
  console.log('OptionsTabCtrl');
})






;
