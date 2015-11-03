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
				// if (dataStream) {
				// 	dataStream.close();
				// }

				var language = localStorage['language'];
				var token = localStorage['default_token'];

				dataStream = new WebSocket('wss://www.binary.com/websockets/v3?l=' + language);

				dataStream.onopen = function() {
					dataStream.send(JSON.stringify({authorize: token}));
					//messageBuffer.push({authorize: token});
					//sendBufferMessages();
				};
				dataStream.onmessage = function(message) {
					receiveMessage(message);
				};
				dataStream.onclose = function(e) {
					console.log('socket is closed ', e);
				};
				dataStream.onerror = function(e) {
					console.log('error in socket ', e);
				};
			};

			var socket = {
				isReady: dataStream && dataStream.readyState === 1,
				isClosed: !dataStream || dataStream.readyState === 3
			};

			var sendMessage = function(_data) {
				// if (socket.isReady) {
				// 	dataStream.send(JSON.stringify(_data))
				// } else {
				// 	messageBuffer.push(_data);
				// 	if (socket.isClosed) {
				// 		init();
				// 	}
				// }
				waitForConnection(function() {
					dataStream.send(JSON.stringify(_data));
				});
			};

			// var sendBufferMessages = function() {
			// 	while (messageBuffer.length > 0) {
			// 		dataStream.send(JSON.stringify(messageBuffer.shift()));
			// 	}
			// };

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
							sessionStorage['active_symbols'] = JSON.stringify(message.active_symbols);
							break;
						case 'payout_currencies':
							sessionStorage['currencies'] = JSON.stringify(message.payout_currencies);
							break;
						case 'proposal':
							$rootScope.$broadcast('proposal', message.proposal);
							break;
						case 'contracts_for':
							console.log('contract for: ', message);
							break;
						case 'buy':
							$rootScope.$broadcast('purchase', message.buy);
							break;
						default:
							console.log('another message type: ', message);
					}
				}
			};

			this.authenticate = function(_token) {
				init();
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
				forgetProposals: function() {
					var data = {
						forget_all: 'proposal'
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
				}
			};

			var waitForConnection = function(callback) {
				if (dataStream.readyState === 3) {
					init();
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				} else if (dataStream.readyState === 1) {
					callback();
				} else {
					setTimeout(function() {
						waitForConnection(callback);
					}, 1000);
				}
			};
	});


























