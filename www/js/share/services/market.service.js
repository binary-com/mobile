/**
 * @name tradeService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */

angular
	.module('binary')
	.service('marketService',
		function(websocketService, proposalService, config) {

			var regroup = function regroup(symbols){
				var groups = {
					index: ['R_100', 'R_25', 'R_50', 'R_75'],
					BEARBULL: ['RDBEAR', 'RDBULL'],
					MOONSUN: ['RDMOON', 'RDSUN'],
					MARSVENUS: ['RDMARS', 'RDVENUS'],
					YANGYIN: ['RDYANG', 'RDYIN'],
				};

				var result = [],
						itemIndices = [];
				Object.keys(groups).forEach(function(key){
					var tmp = [],
							first = -1;
					symbols.forEach(function(item, index){
						if ( item.symbol == groups[key][0] ) {
							first = index;
						}
					});
					if ( first < 0 ) {
						return;
					} else {
						groups[key].forEach(function(item, index){
							var itemIndex = -1;
							symbols.forEach(function(item, i){
								if ( item.symbol == groups[key][index] ) {
									itemIndex = i;
								}
							});
							if ( itemIndex >= 0 ) {
								tmp.push(symbols[itemIndex]);
								itemIndices.push(itemIndex);
							}
						});
						tmp.sort();
						result = result.concat(tmp);
					}
				});
				symbols.forEach(function(symbol, index){
					if ( itemIndices.indexOf(index) < 0 ) {
						result.push(symbol);
					}
				});
				return result;
			};

			var reorder = function reorder(symbols) {
				symbols.sort(function(a, b){
					if ( a.display_name > b.display_name) {
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
                if(!sessionStorage.active_symbols || sessionStorage.active_symbols === 'null'){
                    return;
                }

				var symbols = JSON.parse(sessionStorage.active_symbols);
				Object.keys(symbols).forEach(function(key){
					symbols[key] = reorder(symbols[key]);
				});
				sessionStorage.active_symbols = JSON.stringify(symbols);
			};
		
			this.getActiveMarkets = function() {
                if(!sessionStorage.active_symbols || sessionStorage.active_symbols === "null"){
                    return [];
                }

				var data = JSON.parse(sessionStorage.active_symbols);
                if(data){
    				return Object.keys(data);
                }

                console.log(data);
                return [];
			};

			this.getAllSymbolsForAMarket = function(_market) {
                if(!_market || !sessionStorage.active_symbols || !sessionStorage.asset_index){
                    return [];
                }

				var activeSymbols = JSON.parse(sessionStorage.active_symbols)[_market];
				var assetIndex = JSON.parse(sessionStorage.asset_index);
				var indexes = config.assetIndexes;
				var result = [];

				activeSymbols.map(function(market){
					for(i=0; i < assetIndex.length; i++){
						if(market.symbol === assetIndex[i][indexes.symbol]){
							var assetContracts = assetIndex[i][indexes.contracts];
			                for(var c = 0; c < assetContracts.length; c++) {
			                    if(assetContracts[c][indexes.contractFrom].indexOf('t') !== -1) {
                                    market.display_name = assetIndex[i][indexes.displayName];
			                        result.push(market);
			                        break;
			                    }
			                }
			                break; // do not loop through remained assets, since the related asset_index has been found but is not supporting ticks
	            		}
			        }
			        assetIndex.splice(i, 1); // to shorten the list for the next loop
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
				market: function(_market) {
					var proposal = proposalService.get();
					if (proposal &&
						proposal.passthrough &&
						proposal.passthrough.market &&
						_market[proposal.passthrough.market]) {

						return proposal.passthrough.market;
					}
                    
					//return _market.random ? 'random' : 'forex';
                    return _.findKey(_market, function(o){return o});
				},
				/**
				 * Return the default/selected symbol
				 * @return {String} Symbol Name
				 */
				symbol: function(_market, _symbols) {
					var proposal = proposalService.get();
					if (proposal &&
						proposal.passthrough &&
						proposal.passthrough.market &&
						proposal.symbol &&
						proposal.passthrough.market == _market) {

						return proposal.symbol;
					}
					return _symbols[0].symbol;
				},

				tradeType: function(_tradeTypes) {
                    if(_.isEmpty(_tradeTypes)){
                        return null;
                    }

					var proposal = proposalService.get();
					var contractType = proposal.contract_type;
					var selectedTradeType = _tradeTypes[0].value;
					_tradeTypes.forEach(function(el, i) {
						if (el.value == contractType) {
							selectedTradeType = contractType;
							return;
						}
					});
					return selectedTradeType;
				},

				tick: function() {
					var proposal = proposalService.get();
					return proposal.duration ? proposal.duration : 5;
				},

				digit: function() {
					var proposal = proposalService.get();
					return proposal.barrier ? proposal.barrier : 0;
				},

				basis: function() {
					var proposal = proposalService.get();
					return proposal.basis ? proposal.basis : 'payout';
				},

				amount: function() {
					var proposal = proposalService.get();
                    if(!isNaN(proposal.amount)){
                        return proposal.amount;
                    }
					return 5;
				}
			};

			this.getTradeTypes = function(_symbol) {
				var tradeTypes = config.tradeTypes;
				var finalTradeTypes = [];

				tradeTypes.forEach(function(el, i) {
					for (var key in _symbol) {
						if (_symbol.hasOwnProperty(key)) {
							// Find the tradeType in _symbol list
							if (el.value === key) {
								var hasTicks = false;
								// Loop through all _symbols of a trade type
								for (var j = 0; j < _symbol[key].length; j++) {
									var minDuration = _symbol[key][j].min_contract_duration;
									if (minDuration && minDuration.toString().match(/^\d+t$/)) {
										hasTicks = true;
									}
								}
								if (hasTicks) {
									finalTradeTypes.push(el);
								}
							}
						}
					}
				});

				return finalTradeTypes;
			};

			this.removeActiveSymbols = function(){
				sessionStorage.active_symbols = null;
			}

			this.removeAssetIndex = function(){
				sessionStorage.asset_index = null;
			}

            this.hasActiveSymobols = function(){
                if(!sessionStorage.active_symbols)
                    return false;
                return JSON.parse(sessionStorage.active_symbols);
            }

            this.hasAssetIndex = function(){
                if(!sessionStorage.asset_index)
                    return false;
                return JSON.parse(sessionStorage.asset_index);
            }
	});
