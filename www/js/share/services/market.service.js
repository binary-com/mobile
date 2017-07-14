/**
 * @name tradeService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */

angular.module("binary").service("marketService", function(websocketService, proposalService, config) {
    const regroup = function regroup(symbols) {
        const groups = {
            index    : ["R_100", "R_25", "R_50", "R_75"],
            BEARBULL : ["RDBEAR", "RDBULL"],
            MOONSUN  : ["RDMOON", "RDSUN"],
            MARSVENUS: ["RDMARS", "RDVENUS"],
            YANGYIN  : ["RDYANG", "RDYIN"]
        };

        let result = [];
        const itemIndices = [];
        Object.keys(groups).forEach(key => {
            const tmp = [];
            let first = -1;
            symbols.forEach((item, index) => {
                if (item.symbol === groups[key][0]) {
                    first = index;
                }
            });
            if (first >= 0) {
                groups[key].forEach((item, index) => {
                    let itemIndex = -1;
                    symbols.forEach((item, i) => {
                        if (item.symbol === groups[key][index]) {
                            itemIndex = i;
                        }
                    });
                    if (itemIndex >= 0) {
                        tmp.push(symbols[itemIndex]);
                        itemIndices.push(itemIndex);
                    }
                });
                tmp.sort();
                result = result.concat(tmp);
            }
        });
        symbols.forEach((symbol, index) => {
            if (itemIndices.indexOf(index) < 0) {
                result.push(symbol);
            }
        });
        return result;
    };

    const reorder = function reorder(symbols) {
        symbols.sort((a, b) => {
            if (a.display_name > b.display_name) {
                return 1;
            } else if (a.display_name < b.display_name) {
                return -1;
            }
            return 0;
        });
        symbols = regroup(symbols);
        return symbols;
    };

    this.fixOrder = function() {
        if (!sessionStorage.active_symbols || sessionStorage.active_symbols === "null") {
            return;
        }

        const symbols = JSON.parse(sessionStorage.active_symbols);
        Object.keys(symbols).forEach(key => {
            symbols[key] = reorder(symbols[key]);
        });
        sessionStorage.active_symbols = JSON.stringify(symbols);
    };

    this.getActiveMarkets = function() {
        if (!sessionStorage.active_symbols || sessionStorage.active_symbols === "null") {
            return [];
        }

        const data = JSON.parse(sessionStorage.active_symbols);
        if (data) {
            return Object.keys(data);
        }

        console.log(data); // eslint-disable-line
        return [];
    };

    // TODO Remove getAllSymbolsForAMarket: This function is not used anymore
    this.getAllSymbolsForAMarket = function(_market) {
        if (!_market || !sessionStorage.active_symbols || !sessionStorage.asset_index) {
            return [];
        }

        const activeSymbols = JSON.parse(sessionStorage.active_symbols)[_market];
        const assetIndex = JSON.parse(sessionStorage.asset_index);
        const indexes = config.assetIndexes;
        const result = [];

        activeSymbols.forEach( (market) => {
            for (let i = 0; i < assetIndex.length; i++) {
                if (market.symbol === assetIndex[i][indexes.symbol]) {
                    const assetContracts = assetIndex[i][indexes.contracts];
                    for (let c = 0; c < assetContracts.length; c++) {
                        if (assetContracts[c][indexes.contractFrom].indexOf("t") !== -1) {
                            market.display_name = assetIndex[i][indexes.displayName];
                            result.push(market);
                            break;
                        }
                    }
                    break; // do not loop through remained assets, since the related asset_index has been found but is not supporting ticks
                }
            }
            // assetIndex.splice(i, 1); // to shorten the list for the next loop
        });

        return result;
    };

    this.getSymbolDetails = function(_symbol) {
        websocketService.sendRequestFor.contractsForSymbol(_symbol);
    };

    this.getDefault = {
        /**
				 * Return the default/selected market
				 * @return {String} Market Name
				 */
        market(_market) {
            const proposal = proposalService.get();
            if (
                proposal &&
                proposal.passthrough &&
                proposal.passthrough.market &&
                _market[proposal.passthrough.market]
            ) {
                return proposal.passthrough.market;
            }

            // return _market.random ? 'random' : 'forex';
            return _.findKey(_market, o => o);
        },
        /**
				 * Return the default/selected symbol
				 * @return {String} Symbol Name
				 */
        symbol(_market, _symbols) {
            const proposal = proposalService.get();
            if (
                proposal &&
                proposal.passthrough &&
                proposal.passthrough.market &&
                proposal.symbol &&
                proposal.passthrough.market === _market
            ) {
                return proposal.symbol;
            }
            return _symbols[0].symbol;
        },

        tradeType(_tradeTypes) {
            if (_.isEmpty(_tradeTypes)) {
                return null;
            }

            const proposal = proposalService.get();
            const contractType = proposal.contract_type;
            let selectedTradeType = _tradeTypes[0].value;
            _tradeTypes.forEach((el, i) => {
                if (el.value === contractType) {
                    selectedTradeType = contractType;
                }
            });
            return selectedTradeType;
        },

        tick() {
            const proposal = proposalService.get();
            return proposal.duration ? proposal.duration : 5;
        },

        digit() {
            const proposal = proposalService.get();
            return proposal.barrier ? proposal.barrier : 0;
        },

        basis() {
            const proposal = proposalService.get();
            return proposal.basis ? proposal.basis : "payout";
        },

        amount() {
            const proposal = proposalService.get();
            if (!isNaN(proposal.amount)) {
                return proposal.amount;
            }
            return 5;
        }
    };

    this.getTradeTypes = function(_symbol) {
        const tradeTypes = config.tradeTypes;
        const finalTradeTypes = [];

        tradeTypes.forEach((el, i) => {
            Object.keys(_symbol).forEach((key, index) => {
                if (_symbol.hasOwnProperty(key)) {
                    // Find the tradeType in _symbol list
                    if (el.value === key) {
                        let hasTicks = false;
                        // Loop through all _symbols of a trade type
                        for (let j = 0; j < _symbol[key].length; j++) {
                            const minDuration = _symbol[key][j].min_contract_duration;
                            if (minDuration && minDuration.toString().match(/^\d+t$/)) {
                                hasTicks = true;
                            }
                        }
                        if (hasTicks) {
                            finalTradeTypes.push(el);
                        }
                    }
                }
            });
        });

        return finalTradeTypes;
    };

    this.removeActiveSymbols = function() {
        sessionStorage.active_symbols = null;
    };

    this.removeAssetIndex = function() {
        sessionStorage.asset_index = null;
    };

    this.hasActiveSymobols = function() {
        if (!sessionStorage.active_symbols) return false;
        return JSON.parse(sessionStorage.active_symbols);
    };

    this.hasAssetIndex = function() {
        if (!sessionStorage.asset_index) return false;
        return JSON.parse(sessionStorage.asset_index);
    };
});
