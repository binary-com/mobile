/**
 * @name tokenService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 *
 */

angular
	.module('binary')
	.service('tokenService',
		function(websocketService, $translate) {
			this.defaultTokenExist = function() {
				return localStorage['default_token'] ? true : false;
			};

			this.validateDefaultToken = function() {
				websocketService.authenticate(localStorage['default_token']);
			};

			this.getDefaultToken = function() {
				return localStorage['default_token'];
			};

			this.validateToken = function(_token) {
				websocketService.authenticate(_token);
			};

			this.updateDefaultToken = function(_token) {
				localStorage['default_token'] = _token;
			};

			this.saveInList = function(_token) {
				if (localStorage['tokens'] && (JSON.parse(localStorage['tokens']) instanceof Array)) {
					var tokens = JSON.parse(localStorage['tokens']);
					if (tokens.indexOf(_token) === -1) {
						tokens.push(_token);
						localStorage['tokens'] = JSON.stringify(tokens);
					}
				} else {
					//var tokens = [_token];
					localStorage['tokens'] = JSON.stringify([_token]);
				}
			};

			this.removeFromList = function(_token) {
				if (localStorage['tokens'] && JSON.parse(localStorage['tokens']) instanceof Array) {
					var tokens = JSON.parse(localStorage['tokens']);
					var tokenIndex = tokens.indexOf(_token);
					if (tokenIndex !== -1) {
						tokens.splice(tokenIndex, 1);
						localStorage['tokens'] = JSON.stringify(tokens);
					}
				}
			};

			this.getAllTokens = function() {
				if (localStorage['tokens'] && JSON.parse(localStorage['tokens']) instanceof Array) {
					return JSON.parse(localStorage['tokens']);
				}
				return [];
			};
	});
