/**
 * @name Singin Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/10/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.signin.controllers')
    .controller('SigninController', Signin);

  Signin.$inejct = [
    '$scope',
    '$state',
    '$ionicLoading',
    'accountService',
    'languageService',
    'websocketService',
    'alertService'
  ];

  function Signin($scope, $state, $ionicLoading,
      accountService, languageService,
      websocketService, alertService
      ){
    var vm = this;
    vm.showTokenForm = false;
    vm.showSignin = false;

    /**
     * On load:
     * Open the websocket
     * If default account is set, send it for validation
     */
    var init = function() {
      vm.language = languageService.read();
    };

    init();


    $scope.$on('authorize', function(e, response) {

      $ionicLoading.hide();

      if (response) {
        if (accountService.isUnique(response.loginid)) {
          accountService.add(response);
          accountService.setDefault(response.token);
        }

        vm.token = '';

        $state.go('trade');
      } else {
        alertService.accountError.tokenNotAuthenticated();
      }
    });

    /**
     * SignIn button: event handler
     * @param  {String} _token 15char token
     */
    vm.signIn = function() {
      var _token = vm.token;

      // Validate the token
      if(_token && _token.length === 15) {

        $ionicLoading.show();

        websocketService.authenticate(_token);
      } else {
        alertService.accountError.tokenNotValid();
      }
    };

    vm.changeLanguage = function(){
      languageService.update(vm.language);
    }

    // change different type of signing methods
    vm.changeSigninView = function(_isBack){
      _isBack = _isBack || false;

      $scope.$applyAsync(function(){
        if(!vm.showSignin && vm.showTokenForm){
          vm.showTokenForm = false;
          vm.showSignin = true;
        }
        else if(vm.showSignin && !vm.showTokenForm && _isBack){
          vm.showSignin = false;
        }
        else if(vm.showSignin && !vm.showTokenForm){
          vm.showTokenForm = true;
          vm.showSignin = false;
        }
      });
    }

    vm.showSigninView = function(){
      $scope.$applyAsync(function(){
        vm.showSignin = true;
      });
    }

  }
})();
