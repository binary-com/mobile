/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in functionalities
 */

angular
	.module('binary.services')
	.factory('webSocketFactory',
		function() {
			var dataStream = '';
			var token = '';
			var language = '';
			var dataBuffer = [];

			var getDataStream = function(language) {
				var l = language ? 'l=' + language : '';
				return 'wss://www.binary.com/websockets/v2' + l;
			};

			var websocketIsConnected = function() {
				return !!dataStream && dataStream.readyState !== 3;
			};

			var userIsAuthorized = function() {
				// how to know if the user is authorized
				return true;
			};

			var init = function(token) {
				dataStream = new WebSocket(getDataStream(language));

				dataStream.onopen = function() {
					dataStream.send(JSON.stringify({authorize: token}));
				};
				dataStream.onmessage = function() {

				};
				dataStream.onclose = function(e) {
					console.log('socket is closed ', e);
				};
				dataStream.onerror = function(e) {
					console.log('error in socket ', e);
				};
			};

			this.authenticate = function(token, language) {
				init();
			};

			this.send = function(data) {
				if (websocketIsConnected() && userIsAuthorized()) {
					dataStream.send(JSON.stringify(data));
				} else {
					// go back to login page
					// it shouldn't usually happen
					// we need to keep track of this
				}
			};

			this.close = function() {
				if (dataStream) {
					dataStream.close();
				}
			};


	});







