/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in functionalities
 */

angular
	.module('binary')
	.service('websocketService',
		function($rootScope) {
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

			var broadcast = function(message) {
				if (message && typeof message.msg_type !== 'undefined') {
					$rootScope.$broadcast(message.msg_type, message);
				} else {
					console.log('Error in receiving messages from websocket');
				}
			};

			var init = function() {
				dataStream = new WebSocket('wss://www.binary.com/websockets/v2?l=' + language);

				dataStream.onopen = function() {
					dataStream.send(JSON.stringify({authorize: token}));
				};
				dataStream.onmessage = function(message) {
					console.log('message: ', message.data);
					broadcast(JSON.parse(message.data));
				};
				dataStream.onclose = function(e) {
					console.log('socket is closed ', e);
				};
				dataStream.onerror = function(e) {
					console.log('error in socket ', e);
				};
			};

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
				}
			};

	});
