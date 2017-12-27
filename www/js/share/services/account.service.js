/**
 * @name accountService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 */

angular.module("binary").service("accountService", function(websocketService, appStateService, delayService) {
    /**
			 * find a {key,value} in an array of objects and return its index
			 * returns -1 if not found
			 * @param  {Array of Objects} _accounts
			 * @param  {String} _key
			 * @param  {String, Number, Boolean} _value
			 * @return {Number} Index of the found array element
			 */

    this.addedAccount = "";
    const findIndex = function(_accounts, _key, _value) {
        let index = -1;
        _accounts.forEach((el, i) => {
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
    const storageExist = function() {
        return localStorage.accounts && JSON.parse(localStorage.accounts) instanceof Array;
    };

    /**
			 * Returns the list of all accounts
			 * @return {Array}
			 */
    this.getAll = function() {
        let accounts = storageExist() ? JSON.parse(localStorage.accounts) : [];
        if (accounts.length > 0) {
            accounts = accounts.sort((a, b) => {
                if(a.currency === null){
                    return 1;
                }
                else if(b.currency === null){
                    return -1;
                }
                else if(a.currency === b.currency){
                    return 0;
                }
                else if(a.currency < b.currency) {
                    return -1;
                }
                return 1;
            });
        }
        return accounts;
    };

    /**
			 * Removes the 'accounts' localStorage
			 */
    this.removeAll = function() {
        localStorage.removeItem("accounts");
    };

    /**
			 * Send a token for validation
			 * if '_token' param is not passed, validates the default token
			 * @param  {String} _token
			 */
    const validate = function(_token, extraParams) {
        // Remove the last delay queue of 'symbolsAndAssetIndexUpdate'
        delayService.remove("symbolsAndAssetIndexUpdate");

        if (_token) {
            websocketService.authenticate(_token, extraParams);
        } else {
            const accountList = this.getAll();
            const defaultAccountIndex = findIndex(accountList, "is_default", true);
            // If default account exist
            if (defaultAccountIndex > -1) {
                const token = accountList[defaultAccountIndex].token;
                websocketService.authenticate(token, extraParams);
            }
        }
    };

    this.validate = function(_token, extraParams) {
        if (!_token) {
            const accountList = this.getAll();
            const defaultAccountIndex = findIndex(accountList, "is_default", true);
            // If default account exist
            if (defaultAccountIndex > -1) {
                _token = accountList[defaultAccountIndex].token;
            }
        }

        validate(_token, extraParams);
    };

    /**
			 * Add an account to the 'accounts' localStorage
			 * @param {Object} _account
			 */
    this.add = function(_account) {
        const account = {
            id                  : _account.loginid,
            token               : _account.token,
            currency            : _account.currency,
            email               : _account.email,
            country             : _account.country,
            is_disabled         : _account.is_disabled,
            is_ico_only         : _account.is_ico_only,
            is_virtual          : _account.is_virtual,
            excluded_until      : _account.excluded_until,
            landing_company_name: _account.landing_company_name
        };

        const accountList = this.getAll();

        if (_.find(accountList, ["id", account.id])) {
            return;
        } 
        
        accountList.push(account);
        localStorage.accounts = JSON.stringify(accountList);
    };

    /**
			 * Removes an account from 'accounts' localStorage
			 * Doesn't remove the default account
			 * @param  {String} _token
			 */
    this.remove = function(_token) {
        const accountList = this.getAll();
        const index = findIndex(accountList, "token", _token);
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
        const accountList = this.getAll();
        const index = findIndex(accountList, "token", _token);
        // Make sure the token exist
        if (index > -1) {
            accountList.forEach((el, i) => {
                accountList[i].is_default = accountList[i].token === _token;
            });
            localStorage.accounts = JSON.stringify(accountList);
        }
    };

    /**
			 * Check if the default account exist
			 * @return {Boolean}
			 */
    this.hasDefault = function() {
        const accountList = this.getAll();
        const index = findIndex(accountList, "is_default", true);
        return index > -1;
    };

    /**
			 * Returns the default account
			 * @return {Object}
			 */
    this.getDefault = function() {
        const accountList = this.getAll();
        const index = findIndex(accountList, "is_default", true);
        if (index === -1) {
            return null;
        }
        return accountList[index];
    };

    /**
			 * Check if the token/account is unique
			 * Only one token for each account is allowed
			 * @param  {String}  _id : loginid
			 * @return {Boolean}
			 */
    this.isUnique = function(_id) {
        const accountList = this.getAll();
        const index = findIndex(accountList, "id", _id);
        return !(index > -1);
    };

    this.checkScope = function(_scope) {
        const scopes = _.concat([], _scope);
        let result = false;

        if (appStateService.isLoggedin && !_.isEmpty(appStateService.scopes)) {
            result = true;
            scopes.some((value, index) => {
                if (appStateService.scopes.indexOf(value.toLowerCase()) < 0) {
                    result = false;
                    return true;
                }
                return false;
            });
        }
        return result;
    };

    this.getAllloginids = (_accounts) => {
        const allLoginids = [];
        const accounts = _accounts || this.getAll();
        accounts.forEach((account) => {
            allLoginids.push(account.id);
        });
        return allLoginids;
    }
});
