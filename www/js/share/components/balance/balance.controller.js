/**
 * @name balance controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.balance.controllers')
    .controller('BalanceController', Balance);

  Balance.$inject = [
    '$scope', 'websocketService', 'currencyToSymbolService'
  ]

  function Balance(
      $scope,
      websocketService, currencyToSymbolService) {
    var vm = this;
    vm.balance = {};

    $scope.$on('authorize',
        (e, response, requestId, pathtrough) => {
          vm.balance = {
            currency: response.currency,
            balance: response.balance,
            loginid: response.loginid
          };
          changeProposalCurrency();
        });

    $scope.$on('balance',
        (e, response) => {
          $scope.$applyAsync(() => {
            vm.balance = response;
            changeProposalCurrency();
            vm.formatMoney = function(currency, amount){
              vm.currency = sessionStorage.getItem('currency');
              return currencyToSymbolService.formatMoney(currency, amount);
            }
          });
        });

    function getBalance() {
      websocketService.sendRequestFor.balance();
    }

    function changeProposalCurrency(){
      $scope.$broadcast('currency:changed', vm.balance.currency);
    }

    getBalance();
  }
})();
