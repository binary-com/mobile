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

			this.getActiveMarkets = function() {
				var data = JSON.parse(sessionStorage.active_symbols);
				return Object.keys(data);
			};

			this.getAllSymbolsForAMarket = function(_market) {
				var data = JSON.parse(sessionStorage.active_symbols);
				return data[_market];
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
					return _market.forex ? 'forex' : 'random';
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
					return proposal.amount ? proposal.amount : 5;
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
									if (minDuration && minDuration.toString().match(/^\d+$/)) {
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


			// this.getActiveTickSymbolsForMarket = function(_market) {
			// 	var symbols = JSON.parse(sessionStorage.active_symbols);
			// 	var activeSymbols = symbols[_market];

			// 	var assets = JSON.parse(sessionStorage.asset_index);
			// 	console.log('assets: ', assets);

			// 	activeSymbols.forEach(function(as) {
			// 		console.log('as: ', as.symbol);
			// 		assets.forEach(function(ai) {
			// 			console.log('ai: ', ai[1]);
			// 			console.log('ai: ', ai[2]);
			// 		});
			// 	});

			// 	console.log('-------------------------------');
			// };
	});


















