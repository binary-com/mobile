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
		function($rootScope, messageService) {
			var dataStream = '';
			var token = '';
			var language = '';
			var wsBuffer = [];

			var websocketIsConnected = function() {

				return !!dataStream && dataStream.readyState !== 3;
			};

			var userIsAuthorized = function() {
				// how to know if the user is authorized
				return true;
			};

			var init = function() {
				dataStream = new WebSocket('wss://www.binary.com/websockets/v2?l=' + language);

				dataStream.onopen = function() {
					dataStream.send(JSON.stringify({authorize: token}));
				};
				dataStream.onmessage = function(message) {
					messageService.process(message);
				};
				dataStream.onclose = function(e) {
					console.log('socket is closed ', e);
				};
				dataStream.onerror = function(e) {
					console.log('error in socket ', e);
				};
			};

			// TODO: remove this function
			var transmit = function(data) {
				if (websocketIsConnected() && userIsAuthorized()) {
					dataStream.send(JSON.stringify(data));
				} else {
					// go back to login page
				}
			};

			this.close = function() {
				if (dataStream) {
					dataStream.close();
				}
			};

			this.send = {
				authentication: function(_token, _language) {
					token = _token;
					language = _language;
					init();
				},
				proposal: function() {
					var data = messageService.getProposal();
					dataStream.send(JSON.stringify(data));
				},
				forget: function(_id) {
					var data = {
						'forget': _id
					};
					dataStream.send(JSON.stringify(data));
				},
				buy: function(_id, _price) {
					var data = {
						buy: _id,
						price: _price
					};
					dataStream.send(JSON.stringify(data));
				}
			};
			this.get = {
				tradingTimes: function(_date) {
					var data = {
						trading_times: (_date) ? _date : 'today'
					};
					dataStream.send(JSON.stringify(data));
				}
			};
	});
