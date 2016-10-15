/**
 * @name options controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/21/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.options.controllers')
    .controller('OptionsController', Options);

  Options.$inject = [
      '$scope', 'marketsService',
      'optionsService',
      'proposalService', 'tradeService',
      'tradeTypesService', 'websocketService'];

  function Options($scope, marketsService,
          optionsService,
          proposalService, tradeService,
          tradeTypesService, websocketService) {
    var vm = this;

    vm.SECTIONS = {
      OVERVIEW1: 0,
      OVERVIEW2: 1,
      UNDERLYINGS: 2,
      MARKETS: 3,
      TRADETYPES: 4,
      TICKS: 5,
      DIGITS: 6
    }

    vm.options = {
      market: null,
      underlying: null,
      tradeType: null,
      tick: null,
      digit: null
    };

    vm.section1 = vm.SECTIONS.OVERVIEW1; //vm.options.market ? vm.SECTIONS.OVERVIEW : vm.SECTIONS.MARKETS;
    vm.section2 = vm.SECTIONS.OVERVIEW2;

    $scope.$on('symbols:updated', (e) => {
      websocketService.sendRequestFor.assetIndex();
    });

    $scope.$on('assetIndex:updated', (e) => {
      var markets = marketsService.findTickMarkets();
      if(_.isEmpty(vm.options.market)){
        vm.selectMarket(marketsService.getMarketByIndex(0));
      } else {
        vm.selectMarket(vm.options.market);
      }
    });

    $scope.$on('symbol', (e, groupSymbols) => {
      sessionStorage.groupSymbols = JSON.stringify(groupSymbols);
      var tradeTypes = tradeTypesService.findTickContracts(groupSymbols);
      $scope.$applyAsync(()=>{
        vm.options.tradeType = Object.keys(tradeTypes).indexOf(vm.options.tradeType) > -1 ? vm.options.tradeType || Object.keys(tradeTypes)[0] : Object.keys(tradeTypes)[0];
        vm.options.tick = vm.options.tick || tradeTypes[vm.options.tradeType][0].min_contract_duration.slice(0, -1);
        vm.options.digit = tradeTypes[vm.options.tradeType][0].last_digit_range ? vm.options.digit || tradeTypes[vm.options.tradeType][0].last_digit_range[0] : null;
        vm.options.barrier = tradeTypes[vm.options.tradeType][0].barriers > 0 ? vm.options.barrier || tradeTypes[vm.options.tradeType][0].barrier : null;
        updateProposal();
        tradeService.proposalIsReady = true;
      });

    });

    $scope.$on('authorize', (e, response) =>{
      vm.proposal.currency = response.currency;
    });

    vm.setSection = function(id, section){
      if(id == 1){
        vm.section2 = vm.SECTIONS.OVERVIEW2;
        vm.section1 = section;
      }
      else if( id == 2){
        vm.section1 = vm.SECTIONS.OVERVIEW1;
        vm.section2 = section;
      }
    }

    vm.selectMarket = function(market){
      vm.options.market = market;
      vm.options.underlying = !_.isEmpty(vm.options.underlying) && _.findIndex(market.underlying, ['symbol', vm.options.underlying.symbol]) > -1 ? vm.options.underlying :  market.underlying[0];
      websocketService.sendRequestFor.contractsForSymbol(vm.options.underlying.symbol);
      vm.section1 = vm.SECTIONS.OVERVIEW1;
        updateProposal();
    }

    vm.selectUnderlying = function(underlying){
        vm.options.underlying = underlying;
        websocketService.sendRequestFor.contractsForSymbol(underlying.symbol);
        vm.section1 = vm.SECTIONS.OVERVIEW1;
        updateProposal();
    }

    vm.selectTradeType = function(tradeType){
        vm.options.tradeType = tradeType;
        var tradeType = JSON.parse(sessionStorage.tradeTypes)[tradeType][0];
        vm.options.tick = vm.options.tick || tradeType.min_contract_duration.slice(0, -1);
        vm.options.digit = tradeType.last_digit_range ? vm.options.digit || tradeType.last_digit_range[0] : null;
        vm.options.barrier = tradeType.barriers > 0 && !_.isEmpty(tradeType.barrier) ? vm.options.barrier || tradeType.barrier : null;
        vm.section2 = vm.SECTIONS.OVERVIEW2;
        updateProposal();
    }

    vm.selectTick = function(tick){
        vm.options.tick = tick;
        vm.section2 = vm.SECTIONS.OVERVIEW2;
        updateProposal();
    }

    vm.selectDigit = function(digit){
        vm.options.digit = digit;
        vm.options.barrier = null;
        vm.section2 = vm.SECTIONS.OVERVIEW2;
        updateProposal();
    }

    function init(){
      var options = optionsService.get();
      if(!_.isEmpty(options)){
        vm.options = options;
        //vm.selectMarket(vm.options.market);
        updateProposal();
      }
      websocketService.sendRequestFor.symbols();
    }

    function updateProposal(){
        $scope.$applyAsync(() => {
            vm.proposal = proposalService.update(vm.options);
        });
    }

    init();

  }
})();
