/**
 * @name markets controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/20/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.services").factory("marketsService", Markets);

    Markets.$inject = ["sessionStorageService"];

    function Markets(sessionStorageService) {
        const factory = {};
        let assetIndex = [];

        const ASSETINDEXES = {
            symbol             : 0,
            displayName        : 1,
            contracts          : 2,
            contractName       : 0,
            contractDisplayName: 1,
            contractFrom       : 2,
            contractTo         : 3
        };

        factory.getMarketByIndex = function(index) {
            if (!_.isEmpty(sessionStorage.markets)) {
                const markets = JSON.parse(sessionStorage.markets || null);
                const keys = Object.keys(markets);
                return markets[keys[index]];
            }
            return null;
        };

        factory.findTickMarkets = function() {
            const activeSymbols = JSON.parse(sessionStorageService.getItem("active_symbols"));
            assetIndex = JSON.parse(sessionStorageService.getItem("asset_index"));

            const markets = {};

            _.forEach(activeSymbols, (value, key) => {
                const underlying = [];

                value.forEach((v, i) => {
                    if (isSupportTick(value[i].symbol)) {
                        underlying.push(value[i]);
                    }
                });

                if (underlying.length > 0) {
                    markets[key] = {
                        displayName: value[0].market_display_name,
                        underlying
                    };
                }
            });

            sessionStorage.markets = JSON.stringify(markets);

            return markets;
        };

        function isSupportTick(symbol) {
            const symbolIndex = _.findIndex(assetIndex, value => value[ASSETINDEXES.symbol] === symbol);

            if (symbolIndex > -1) {
                const tickUnderlying = _.findIndex(
                    assetIndex[symbolIndex][ASSETINDEXES.contracts],
                    value => value[ASSETINDEXES.contractFrom].indexOf("t") > -1
                );

                return tickUnderlying > -1;
            }

            return false;
        }

        return factory;
    }
})();
