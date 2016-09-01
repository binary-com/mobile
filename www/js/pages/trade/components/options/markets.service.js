/**
 * @name markets controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/20/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.pages.trade.components.options.services')
    .factory('marketsService', Markets);

  Markets.$inject = [];

  function Markets(){
    var factory = {};
    var assetIndex = [];

    var ASSETINDEXES = {
		    symbol: 0,
		    displayName: 1,
		    contracts : 2,
		        contractName: 0,
		        contractDisplayName: 1,
		        contractFrom: 2,
		        contractTo  : 3
		}

    factory.getMarketByIndex = function(index){
      if(!_.isEmpty(sessionStorage.markets)){
        var markets = JSON.parse(sessionStorage.markets);
        var keys = Object.keys(markets);
        return markets[keys[index]];
      }
      return null;
    }

    factory.findTickMarkets = function(){
      var activeSymbols = JSON.parse(sessionStorage.active_symbols);
      assetIndex = JSON.parse(sessionStorage.asset_index);

      var markets = {};

      _.forEach(activeSymbols, (value, key) => {
        var underlying = [];

        for(var i in value){
          if(isSupportTick(value[i].symbol)){
            underlying.push(value[i]);
          }
        }

        if(underlying.length > 0){
          markets[key] = {
            displayName: value[0].market_display_name,
            underlying: underlying
          };
        }
      });

      sessionStorage.markets = JSON.stringify(markets);

      return markets;
    }

    function isSupportTick(symbol){
      var symbolIndex = _.findIndex(assetIndex, (value) => {
        return value[ASSETINDEXES.symbol] === symbol;
      });

      if(symbolIndex > -1){
        var tickUnderlying = _.findIndex(assetIndex[symbolIndex][ASSETINDEXES.contracts], (value) => {
          return value[ASSETINDEXES.contractFrom].indexOf('t') > -1;
        });

        return tickUnderlying > -1;
      }

      return false;

    }

    return factory;
  }
})();
