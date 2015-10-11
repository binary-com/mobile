angular.module('binary', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/sign-in.html',
      controller: 'SignInController'
    })
    .state('trade', {
      url: '/trade',
      templateUrl: 'templates/trade.html',
      controller: 'TradeController'
    })
    .state('tradein', {
      url: '/trade-in',
      templateUrl: 'templates/trade-in.html',
      controller: 'TradeInControllere'
    });


   $urlRouterProvider.otherwise('/sign-in');

})

.controller('SignInController', function($scope, $state) {

  $scope.signIn = function(user) {
    console.log('Sign-In', user);
    $state.go('trade');
  };
})

.controller('TradeController', function($scope, $state, $ionicPopover) {

  $ionicPopover.fromTemplateUrl('templates/options.html', {
    scope: $scope
  }).then(function(popover) {
    console.log('popover', popover);
    $scope.popover = popover;
  });

  $scope.displayOptions = function($event) {
    console.log('options is clicked!!');
    $scope.popover.show($event);
  };

  $scope.$on('popover.hidden', function() {
    // Execute action
    console.log('it is hiden');
  });

  $scope.purchase = function() {

    $state.go('tradein');
  };

  $scope.logout = function() {
    $state.go('signin');
  }

})

.controller('TradeInControllere', function($scope, $state) {
  console.log('TradeInControllere');
  $scope.back = function() {
    $state.go('trade');
  }
});








