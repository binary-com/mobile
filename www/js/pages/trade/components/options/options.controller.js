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
      OVERVIEW: 0,
      MARKETS: 1,
      UNDERLYINGS: 2,
      TRADETYPES: 3,
      TICKS: 4,
      DIGITS: 5
    }

    vm.options = {
      market: null,
      underlying: null,
      tradeType: null,
      tick: null,
      digit: null
    };

    vm.section = vm.SECTIONS.OVERVIEW; //vm.options.market ? vm.SECTIONS.OVERVIEW : vm.SECTIONS.MARKETS;

    $scope.$on('symbols:updated', (e) => {
      websocketService.sendRequestFor.assetIndex();
    });

    $scope.$on('assetIndex:updated', (e) => {
      var markets = marketsService.findTickMarkets();
      if(_.isEmpty(vm.options.market)){
        vm.selectMarket(marketsService.getMarketByIndex(0));
      }
    });

    $scope.$on('symbol', (e, groupSymbols) => {
      sessionStorage.groupSymbols = JSON.stringify(groupSymbols);
      var tradeTypes = tradeTypesService.findTickContracts(groupSymbols);
      $scope.$applyAsync(()=>{
        vm.options.tradeType = Object.keys(tradeTypes)[0];
        vm.options.tick = tradeTypes[vm.options.tradeType][0].min_contract_duration.slice(0, -1);
        vm.options.digit = tradeTypes[vm.options.tradeType][0].last_digit_range ? tradeTypes[vm.options.tradeType][0].last_digit_range[0] : null;
        updateProposal();
        tradeService.proposalIsReady = true;
      });

    });

    vm.setSection = function(section){
      vm.section = section;
    }

    vm.selectMarket = function(market){
      vm.options.market = market;
      vm.options.underlying = market.underlying[0];
      websocketService.sendRequestFor.contractsForSymbol(vm.options.underlying.symbol);
      vm.section = vm.SECTIONS.OVERVIEW;
        updateProposal();
    }

    vm.selectUnderlying = function(underlying){
        vm.options.underlying = underlying;
        websocketService.sendRequestFor.contractsForSymbol(underlying.symbol);
        vm.section = vm.SECTIONS.OVERVIEW;
        updateProposal();
    }

    vm.selectTradeType = function(tradeType){
        vm.options.tradeType = tradeType;
        var tradeType = JSON.parse(sessionStorage.tradeTypes)[tradeType][0];
        vm.options.tick = tradeType.min_contract_duration.slice(0, -1);
        vm.options.digit = tradeType.last_digit_range ? tradeType.last_digit_range[0] : null;
        vm.section = vm.SECTIONS.OVERVIEW;
        updateProposal();
    }

    vm.selectTick = function(tick){
        vm.options.tick = tick;
        vm.section = vm.SECTIONS.OVERVIEW;
        updateProposal();
    }

    vm.selectDigit = function(digit){
        vm.options.digit = digit;
        vm.section = vm.SECTIONS.OVERVIEW;
        updateProposal();
    }

    function init(){
      var options = optionsService.get();
      if(!_.isEmpty(options)){
        vm.options = options;
        vm.selectMarket(vm.options.market);
        updateProposal();
      }
      websocketService.sendRequestFor.symbols();
    }

    function updateProposal(){
        //if(!_.isEmpty(vm.proposal)){
        $scope.$applyAsync(() => {
            vm.proposal = proposalService.update(vm.options);
        });
        //}
    }

    init();

  }
})();
