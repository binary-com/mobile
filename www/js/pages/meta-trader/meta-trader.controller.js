/**
 * @name MetaTrader Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 04/15/2017
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.meta-trader.controllers')
    .controller('MetaTraderController', MetaTrader);

  MetaTrader.$inject = ['$scope', 'accountService', 'websocketService'];

  function MetaTrader($scope, accountService, websocketService){
    var vm = this;
    vm.hasMTAccess = null;
    vm.upgradeYourAccount = false;

    $scope.$on('landing_company', (e, landingCompany)=>{
      $scope.$applyAsync(()=>{
        if(landingCompany.hasOwnProperty('mt_financial_company')
            && landingCompany.mt_financial_company.shortcode == 'vanuatu'){
          vm.hasMTAccess = true;
          websocketService.sendRequestFor.mt5LoginList();
        } else {
          vm.hasMTAccess = false;
        }
      });
    });

    $scope.$on('mt5_login_list:success', (e, list)=>{
      $scope.$applyAsync(()=>{
        vm.list = list;
        vm.loadAccount('demo');
      });
    });

    $scope.$on('mt5_get_settings:success', (e, settings) => {
      $scope.$applyAsync(()=>{
        vm.settings = settings;
      });
    });

    vm.createMTAccount = function(){
      window.open('https://mt.binary.com', '_system');
    };

    vm.loadAccount = function(accountName){
      if(vm.list.length > 0){
        var account = _.find(vm.list, (o) => {
          if(o.group){
            return o.group.indexOf(accountName) > -1;
          }
          return null;
        });
        if(account){
          websocketService.sendRequestFor.mt5GetSettings(account.login);
          $scope.$applyAsync(()=>{
            vm.upgradeYourAccount = false;
          });
        } else {
          $scope.$applyAsync(()=>{
            vm.upgradeYourAccount = true;
          });
        }
        $scope.$applyAsync(()=>{
          vm.openCard = accountName;
          vm.settings = null;
        });
      }
    };

    vm.openMT5 = function(type){
      var url = 'https://trade.mql5.com/trade?servers=Binary.com-Server&trade_server=Binary.com-Server&login=';
      url += vm.settings.login;
      window.open(url, type, 'location=no');
    };

    init();

    function init(){
      var account = accountService.getDefault();
      if (account){
        websocketService.sendRequestFor.landingCompanySend(account.country);
      }
    }

  }
})();
