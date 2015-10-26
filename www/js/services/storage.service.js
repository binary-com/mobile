/**
 * @name storageService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/25/2015
 * @copyright Binary Ltd
 * Handles storageService functionalities
 */

angular
	.module('binary')
	.service('storageService',
		function() {
			this.token = {
				add: function(_token) {
					if (localStorage['tokens'] && (JSON.parse(localStorage['tokens']) instanceof Array)) {
						var tokens = JSON.parse(localStorage['tokens']);
						if (tokens.indexOf(_token) === -1) {
							tokens.push(_token);
							localStorage['tokens'] = JSON.stringify(tokens);
						}
					} else {
						var tokens = [_token];
						localStorage['tokens'] = JSON.stringify(tokens);
					}
				},
				remove: function(_token) {
					if (localStorage['tokens'] && JSON.parse(localStorage['tokens']) instanceof Array) {
						var tokens = JSON.parse(localStorage['tokens']);
						var tokenIndex = tokens.indexOf(_token);
						if (tokenIndex !== -1) {
							tokens.splice(tokenIndex, 1);
							localStorage['tokens'] = JSON.stringify(tokens);
						}
					}
				},
				get: function() {
					if (localStorage['tokens'] && JSON.parse(localStorage['tokens']) instanceof Array) {
						return JSON.parse(localStorage['tokens']);
					}
					return [];
				}
			}
	});



















