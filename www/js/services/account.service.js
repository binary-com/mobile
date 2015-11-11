/**
 * @name accountService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 *
 */

angular
	.module('binary')
	.service('accountService',
		function(websocketService, $translate) {
			var accounts = {
				validate: function(_token) {
					websocketService.authenticate(_token);
				},
				exist: function() {
					return localStorage.accounts && JSON.parse(localStorage.accounts) instanceof Array;
				},
				find: function(_accounts, _token) {
					var index = -1;
					_accounts.forEach(function(el, i) {
						if (_accounts[i].token === _token) {
							index = i;
						}
					});
					return index;
				},
				findById: function(_accounts, _id) {
					var index = -1;
					_accounts.forEach(function(el, i) {
						if (_accounts[i].id === _id) {
							index = i;
						}
					});
					return index;
				},
				setDefault: function(_accounts, _index) {
					_accounts[_index].is_default = true;
					localStorage.accounts = JSON.stringify(_accounts);
				},
				getDefault: function(_accounts) {
					var defaultAccount = {};
					_accounts.forEach(function(el, i) {
						if (_accounts[i].is_default === true) {
							defaultAccount = _accounts[i];
						}
					});
					return defaultAccount;
				},
				isDefault: function(_accounts, _index) {
					return _accounts[_index].is_default;
				},
				unsetDefault: function(_accounts) {
					_accounts.forEach(function(el, i) {
						_accounts[i].is_default = false;
					});
					return _accounts;
				},
				add: function(_accounts, _account) {
					_accounts.push(_account);
					localStorage.accounts = JSON.stringify(_accounts);
				},
				remove: function(_accounts, _index) {
					_accounts.splice(_index, 1);
					localStorage.accounts = JSON.stringify(_accounts);
				},
				removeAll: function() {
					localStorage.removeItem('accounts');
				},
				getAll: function() {
					if (localStorage.accounts) {
						return JSON.parse(localStorage.accounts);
					}
					return [];
				}
			};

			/**
			 * Returns the list of all accounts stored in localStorage.accounts
			 * @return {Array} List of all accounts
			 */
			this.getAllAccounts = function() {
				if (accounts.exist()) {
					return JSON.parse(localStorage.accounts);
				}
				return [];
			};

			/**
			 * Remove an account from the list of accounts stored in localStorage.accounts
			 * @param  {String} _token
			 * @return {Array}  List of all accounts
			 */
			this.removeAccount = function(_token) {
				var accountList = accounts.getAll();
				var index = accounts.find(accountList, _token);
				if (index > -1 && !accounts.isDefault(accountList, index)) {
					accounts.remove(accountList, index);
				}
			};

			/**
			 * Adds an account to the list of accounts stored in localStorage.accounts
			 * @param {Object} _account : containing: id and token
			 */
			this.addAccount = function(_account) {
				var account = {
					id: _account.loginid,
					token: _account.token,
					is_default: false
				};

				if (accounts.exist()) {
					var accountList = accounts.getAll();
					var index = accounts.find(accountList, _account.token);
					if (index === -1) {
						accounts.add(accountList, account);
					}
				} else{
					accounts.add([], account);
				}
			};

			this.validateAccount = function(_token) {
				if (_token) {
					accounts.validate(_token);
				} else {
					var accountList = accounts.getAll();
					var defaultAccount = accounts.getDefault(accountList);
					accounts.validate(defaultAccount.token);
				}
			};

			this.hasDefaultAccount = function() {
				var accountList = accounts.getAll();
				if (accountList.length > 0 && accounts.getDefault(accountList)) {
					return true;
				}
				return false;
			};

			this.setDefaultAccount = function(_token) {
				var accountList = accounts.getAll();
				if (accountList.length > 0) {
					var index = accounts.find(accountList, _token);
					accounts.unsetDefault(accountList);
					accounts.setDefault(accountList, index);
				}
			};

			this.getDefaultAccount = function() {
				var accountList = accounts.getAll();
				return accounts.getDefault(accountList);
			};

			this.removeAllAccounts = function() {
				accounts.removeAll();
			};

			this.isUnique = function(_id) {
				var accountList = accounts.getAll();
				return (accounts.findById(accountList, _id) > -1) ? false : true;
			};
	});






















