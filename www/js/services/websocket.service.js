/**
 * @name websocketService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/15/2015
 * @copyright Binary Ltd
 * Handles websocket functionalities
 */

angular
	.module('binary')
	.service('websocketService',
		function($rootScope) {
			var dataStream = '';
			var messageBuffer = [];
			var init = function() {
				var language = localStorage.language || 'en';

				dataStream = new WebSocket('wss://ws.binaryws.com/websockets/v3?l=' + language);

				dataStream.onopen = function() {
					console.log('socket is opened');
					if(typeof(analytics) !== "undefined"){
						analytics.trackEvent('WebSocket', 'OpenConnection', 'OpenConnection', 25);
					}
					dataStream.send(JSON.stringify({ping: 1}));
				};
				dataStream.onmessage = function(message) {
					receiveMessage(message);
				};
				dataStream.onclose = function(e) {
					console.log('socket is closed ', e);
					init();
					console.log('socket is reopened');
					$rootScope.$broadcast('connection:reopened');
				};
				dataStream.onerror = function(e) {
					console.log('error in socket ', e);
				};
			};

			var waitForConnection = function(callback) {
				if (dataStream.readyState === 3) {
					init();
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				} else if (dataStream.readyState === 1) {
					callback();
				} else if (!(dataStream instanceof WebSocket)) {
					init();
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				} else {
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				}
			};

			var sendMessage = function(_data) {
				waitForConnection(function() {
					dataStream.send(JSON.stringify(_data));
				});
			};

			var receiveMessage = function(_response) {
				var message = JSON.parse(_response.data);
				if (message) {
					var messageType = message.msg_type;
					switch(messageType) {
						case 'authorize':
							if (message.authorize) {
								message.authorize.token = message.echo_req.authorize;
								$rootScope.$broadcast('authorize', message.authorize);
							} else {
								$rootScope.$broadcast('authorize', false);
							}
							break;
						case 'active_symbols':
							var markets = message.active_symbols;
							var groupedMarkets = _.groupBy(markets, 'market');
							var openMarkets = {};
							for (var key in groupedMarkets) {
								if (groupedMarkets.hasOwnProperty(key)) {
									if (groupedMarkets[key][0].exchange_is_open == 1) {
										openMarkets[key] = groupedMarkets[key];
									}
								}
							}
							sessionStorage.active_symbols = JSON.stringify(openMarkets);
							$rootScope.$broadcast('symbols:updated');
							break;
						case 'asset_index':
							sessionStorage.asset_index = JSON.stringify(message.asset_index);
							$rootScope.$broadcast('assetIndex:updated');
							break;
						case 'payout_currencies':
							sessionStorage.currencies = JSON.stringify(message.payout_currencies);
							break;
						case 'proposal':
							$rootScope.$broadcast('proposal', message.proposal);
							break;
						case 'contracts_for':
							var symbol = message.echo_req.contracts_for;
							var groupedSymbol = _.groupBy(message.contracts_for.available, 'contract_type');
							$rootScope.$broadcast('symbol', groupedSymbol);
							break;
						case 'buy':
							$rootScope.$broadcast('purchase', message);
							break;
						case 'balance':
							$rootScope.$broadcast('balance', message.balance);
							break;
						case 'tick':
							$rootScope.$broadcast('tick', message);
							break;
						case 'history':
							$rootScope.$broadcast('history', message);
							break;
						case 'candles':
							$rootScope.$broadcast('candles', message);
							break;
						case 'ohlc':
							$rootScope.$broadcast('ohlc', message);
							break;
						case 'portfolio':
							$rootScope.$broadcast('portfolio', message.portfolio);
							break;
						default:
							//console.log('another message type: ', message);
					}
				}
			};

			this.init = function() {
				setInterval(function restart() {
					if (!dataStream || dataStream.readyState === 3) {
						init();
					}
					return restart;
				}(), 1000);
			};

			this.authenticate = function(_token) {
				//init();
				var data = {
					authorize: _token
				};
				sendMessage(data);
			};

			this.sendRequestFor = {
				symbols: function() {
					var data = {
						active_symbols: "brief"
					};
					sendMessage(data);
					setInterval(function(){
						sendMessage(data);
					}, 60 * 1000);
				},
				assetIndex: function() {
					var data = {
						asset_index: 1
					};
					sendMessage(data);
					setInterval(function(){
						sendMessage(data);
					}, 60 * 1000);
				},
				currencies: function() {
					var data = {
						payout_currencies: 1
					};
					sendMessage(data);
				},
				contractsForSymbol: function(_symbol) {
					var data = {
						contracts_for: _symbol
					};
					sendMessage(data);
				},
				ticksForSymbol: function(_symbol) {
					var data = {
						ticks: _symbol
					};
					sendMessage(data);
				},
				forgetProposal: function(_id) {
					var data = {
						forget: _id
					};
					sendMessage(data);
				},
				forgetProposals: function() {
					var data = {
						forget_all: 'proposal'
					};
					sendMessage(data);
				},
				forgetTicks: function() {
					var data = {
						forget_all: 'ticks'
					};
					sendMessage(data);
				},
				proposal: function(_proposal) {
					sendMessage(_proposal);
				},
				purchase: function(_proposalId, price) {
					var data = {
						buy: _proposalId,
						price: price || 0
					};
					sendMessage(data);
				},
				balance: function() {
					var data = {
						balance: 1,
						subscribe: 1
					};
					sendMessage(data);
				},
				portfolio: function() {
					var data = {
						portfolio: 1
					};
					sendMessage(data);
				},
				ticksHistory: function(data) {
					// data is the whole JSON convertable object parameter for the ticks_history API call
					if (data.ticks_history) {
						sendMessage(data);
					}
				}
			};
	});
