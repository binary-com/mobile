angular.module('binary', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('tabs', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    })
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInCtrl'
    })
    .state('trade', {
      url: '/trade',
      templateUrl: 'templates/trade.html',
      controller: 'TradeController'
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
    });


   $urlRouterProvider.otherwise('/sign-in');

})

.controller('SignInCtrl', function($scope, $state) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('trade');
  };
})
.controller('MassihTabCtrl', function($scope) {
  console.log('MassihTabCtrl');
  //$state.go('massih');
})
.controller('TradeController', function($scope, $ionicPopover) {
  console.log('TradeTabCtrl -  show me');

  $ionicPopover.fromTemplateUrl('templates/options.html', {
    scope: $scope
  }).then(function(popover) {
    console.log('popover', popover);
    $scope.popover = popover;
    // $scope.popover.initialize({
    //   hardwareBackButtonClose: true
    // });

  });

  $scope.displayOptions = function($event) {
    console.log('options is clicked!!');
    $scope.popover.show($event);
  };

  $scope.$on('popover.hidden', function() {
    // Execute action
    console.log('it is hiden');
  });

})

.controller('AccountTabCtrl', function($scope) {
  console.log('AccountTabCtrl');
})

.controller('OptionsTabCtrl', function($scope) {
  console.log('OptionsTabCtrl');
});







