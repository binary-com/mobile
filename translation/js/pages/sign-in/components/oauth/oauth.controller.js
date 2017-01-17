/**
 * @name Oauth Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/13/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.signin.components.oauth')
    .controller('OauthController', Oauth);

  Oauth.$inject = [
    '$scope',
    '$ionicLoading',
    'config',
    'websocketService',
    'alertService',
    'accountService',
    'languageService',
  ];

  function Oauth($scope, $ionicLoading, config, websocketService,
      alertService, accountService, languageService){

    var vm = this;

    var accounts = [];

    var authenticate = function(_token){
      // Validate the token
      if(_token && _token.length == 32) {
        $ionicLoading.show();
        websocketService.authenticate(_token);
      } else {
        alertService.accountError.tokenNotValid();
      }
    }

    window.onmessage = function(_message){
      if(_message.data && _message.data.url){
        accounts = getAccountsFromUrl(_message.data.url);
        if(accounts.length > 0){
          authenticate(accounts[0].token);
        }
      }
    }

    $scope.$on('authorize', (e, response) => {
      if(response){
        for(var a in accounts){
          if (a == 0){
            continue;
          }

          accounts[a].email = response.email;
          accountService.add(accounts[a]);
        }
      }
      $ionicLoading.hide();
    });

    vm.signin = function(){
      var authWindow = window.open(config.oauthUrl + '?app_id=' + config.app_id + '&l=' + languageService.read(),
          "_blank",
          "location=no,toolbar=no");

      $(authWindow).on('loadstart',
          function(e){
            var url = e.originalEvent.url;

            if(getErrorFromUrl(url).length > 0){
              authWindow.close();
              return;
            }

            accounts = getAccountsFromUrl(url);
            if(accounts && accounts.length){
              authWindow.close();

              authenticate(accounts[0].token);
            }
          });
    }


    function getAccountsFromUrl(_url){
      var regex = /acct\d+=(\w+)&token\d+=(\w{2}-\w{29})/g;
      var result = null;
      var accounts = [];

      while(result=regex.exec(_url)){
        accounts.push({
          loginid: result[1],
          token: result[2],
          email: "",
          is_default: false
        });
      }

      return accounts;

    }

    function getErrorFromUrl(_url){
      var regex = /error=(\w+)/g;
      var result = null;
      var error = [];

      while(result = regex.exec(_url)){
        error.push(result[1]);
      }

      return error;
    }

  }
})();
