/**
 * @name options controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/21/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
      .module('binary.pages.trade.components.options.controllers')
      .controller('OptionsController', Options);

    Options.$inject = [
      '$scope',
      '$ionicModal',
      'marketsService',
      'optionsService',
      'proposalService',
      'tradeService',
      'tradeTypesService',
      'websocketService'
    ];

    function Options($scope, $ionicModal, marketsService,
                     optionsService, proposalService, tradeService,
                     tradeTypesService, websocketService) {
        var vm = this;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        vm.showOptions = false;
        vm.marketsClosed = false;

        vm.options = {
          market: null,
          underlying: null,
          tradeType: null,
          tick: null,
          digit: null
        };

        $scope.$on('symbols:updated', (e, openMarkets) => {
          if (_.isEmpty(openMarkets)) {
            vm.showOptions = false;
            vm.marketsClosed = true;
            vm.proposal = {};
          } else {
            vm.showOptions = true;
            websocketService.sendRequestFor.assetIndex();
          }
        });

        $scope.$on('assetIndex:updated', (e) => {
          var markets = marketsService.findTickMarkets();
          if (!_.isEmpty(vm.options.market) && _.find(markets, ['displayName', vm.options.market.displayName])) {
            vm.selectMarket();
          } else {
            vm.options.market = marketsService.getMarketByIndex(0);
          }
        });

        $scope.$on('symbol', (e, groupSymbols) => {
          sessionStorage.groupSymbols = JSON.stringify(groupSymbols);
          var tradeTypes = tradeTypesService.findTickContracts(groupSymbols);
          $scope.$applyAsync(() => {
            vm.options.tradeType = Object.keys(tradeTypes).indexOf(vm.options.tradeType) > -1 ? vm.options.tradeType || Object.keys(tradeTypes)[0] : Object.keys(tradeTypes)[0];
            vm.options.tick = vm.options.tick || tradeTypes[vm.options.tradeType][0].min_contract_duration.slice(0, -1);
            vm.options.digit = tradeTypes[vm.options.tradeType][0].last_digit_range ? vm.options.digit || tradeTypes[vm.options.tradeType][0].last_digit_range[0] : null;
            vm.options.barrier = tradeTypes[vm.options.tradeType][0].barriers > 0 ? vm.options.barrier || tradeTypes[vm.options.tradeType][0].barrier : null;
            updateProposal();
            tradeService.proposalIsReady = true;
          });
        });

        $scope.$on('authorize', (e, response) => {
          vm.proposal.currency = response.currency;
        });

        $scope.$on('options:updated', (e, options) => {
          vm.options = options;
        });

        $ionicModal.fromTemplateUrl('js/pages/trade/components/options/options-modal.html', {
          scope: $scope
        }).then(function(modal) {
          vm.modalCtrl = modal;
        });

        vm.closeModal = function(){
          hideModal();
        }

        vm.openOptions = function() {
          var markets = JSON.parse(sessionStorage.markets || '{}');
          var tradeTypes = JSON.parse(sessionStorage.tradeTypes || '{}');
          vm.modalCtrl.show();
        }

        vm.selectMarket = function() {
          var market = vm.options.market;
          vm.options.underlying = !_.isEmpty(vm.options.underlying) && _.findIndex(market.underlying, ['symbol', vm.options.underlying.symbol]) > -1 ? vm.options.underlying : market.underlying[0];
          websocketService.sendRequestFor.contractsForSymbol(vm.options.underlying.symbol);
          updateProposal();
        }

        vm.selectUnderlying = function() {
          var underlying = vm.options.underlying;
          websocketService.sendRequestFor.contractsForSymbol(underlying.symbol);
          updateProposal();
        }

        vm.selectTradeType = function() {
          var tradeType = JSON.parse(sessionStorage.tradeTypes)[vm.options.tradeType][0];
          vm.options.tick = vm.options.tick || tradeType.min_contract_duration.slice(0, -1);
          vm.options.digit = tradeType.last_digit_range ? vm.options.digit || tradeType.last_digit_range[0] : null;
          vm.options.barrier = tradeType.barriers > 0 && !_.isEmpty(tradeType.barrier) ? vm.options.barrier || tradeType.barrier : null;
          updateProposal();
        }

        vm.selectTick = function() {
          var tick = vm.options.tick;
          updateProposal();
        }

        vm.selectDigit = function() {
          var digit = vm.options.digit;
          vm.options.barrier = null;
          updateProposal();
        }

        function init() {
          var options = optionsService.get();
          if (!_.isEmpty(options)) {
            vm.options = options;
            //vm.selectMarket(vm.options.market);
            updateProposal();
          }
          websocketService.sendRequestFor.symbols();
        }

        function updateProposal() {
          $scope.$applyAsync(() => {
            vm.proposal = proposalService.update(vm.options);
          });
        }

        function hideModal(){
          if(vm.modalCtrl){
            vm.modalCtrl.hide();
          }
        }

        init();

    }
})();
