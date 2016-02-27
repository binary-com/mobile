/**
 * @name accountService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.service('accountService',
		function(websocketService) {
			/**
			 * find a {key,value} in an array of objects and return its index
			 * returns -1 if not found
			 * @param  {Array of Objects} _accounts
			 * @param  {String} _key
			 * @param  {String, Number, Boolean} _value
			 * @return {Number} Index of the found array element
			 */
			var findIndex = function(_accounts, _key, _value) {
				var index = -1;
				_accounts.forEach(function(el, i) {
					if (_accounts[i][_key] === _value) {
						index = i;
					}
				});
				return index;
			};

			/**
			 * Check if the 'accounts' localStorage exist
			 * @return {Boolean}
			 */
			var storageExist = function() {
				return localStorage.accounts && JSON.parse(localStorage.accounts) instanceof Array;
			};

			/**
			 * Returns the list of all accounts
			 * @return {Array}
			 */
			this.getAll = function() {
				return storageExist() ? JSON.parse(localStorage.accounts) : [];
			};

			/**
			 * Removes the 'accounts' localStorage
			 */
			this.removeAll = function() {
				localStorage.removeItem('accounts');
			};

			/**
			 * Send a token for validation
			 * if '_token' param is not passed, validates the default token
			 * @param  {String} _token
			 */
			var validate = function(_token, extraParams) {
				if (_token) {
					websocketService.authenticate(_token, extraParams);
				} else {
					var accountList = this.getAll();
					var defaultAccountIndex = findIndex(accountList, 'is_default', true);
					// If default account exist
					if (defaultAccountIndex > -1) {
						var token = accountList[defaultAccountIndex].token;
						websocketService.authenticate(token, extraParams);
					}
				}
			};

			this.validate = function(_token, extraParams) {
				if (!_token) {
					var accountList = this.getAll();
					var defaultAccountIndex = findIndex(accountList, 'is_default', true);
					// If default account exist
					if (defaultAccountIndex > -1) {
						_token = accountList[defaultAccountIndex].token;
					}
				}

				validate(_token, extraParams);
				// setInterval(function() {
				// 	validate(_token);
				// }, 1000);
			};

			/**
			 * Add an account to the 'accounts' localStorage
			 * @param {Object} _account
			 */
			this.add = function(_account) {
				var account = {
					id: _account.loginid,
					token: _account.token,
					currency: _account.currency,
					email: _account.email,
					is_default: false
				};

				var accountList = this.getAll();
				accountList.push(account);
				localStorage.accounts = JSON.stringify(accountList);
			};

			/**
			 * Removes an account from 'accounts' localStorage
			 * Doesn't remove the default account
			 * @param  {String} _token
			 */
			this.remove = function(_token) {
				var accountList = this.getAll();
				var index = findIndex(accountList, 'token', _token);
				// If the token exist and is not the default token
				if (index > -1 && accountList[index].is_default !== true) {
					accountList.splice(index, 1);
					localStorage.accounts = JSON.stringify(accountList);
				}
			};

			/**
			 * Set the passed token as the default account
			 * @param {String} _token
			 */
			this.setDefault = function(_token) {
				var accountList = this.getAll();
				var index = findIndex(accountList, 'token', _token);
				// Make sure the token exist
				if (index > -1) {
					accountList.forEach(function(el, i) {
						accountList[i].is_default = (accountList[i].token === _token) ? true : false;
					});
					localStorage.accounts = JSON.stringify(accountList);
				}
			};

			/**
			 * Check if the default account exist
			 * @return {Boolean}
			 */
			this.hasDefault = function() {
				var accountList = this.getAll();
				var index = findIndex(accountList, 'is_default', true);
				return (index > -1) ? true : false;
			};

			/**
			 * Returns the default account
			 * @return {Object}
			 */
			this.getDefault = function() {
				var accountList = this.getAll();
				var index = findIndex(accountList, 'is_default', true);
				return accountList[index];
			};

			/**
			 * Check if the token/account is unique
			 * Only one token for each account is allowed
			 * @param  {String}  _id : loginid
			 * @return {Boolean}
			 */
			this.isUnique = function(_id) {
				var accountList = this.getAll();
				var index = findIndex(accountList, 'id', _id);
				return (index > -1) ? false : true;
			};
	});
