/**
 * @name cleanupService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/31/2015
 * @copyright Binary Ltd
 *
 */

angular.module("binary").factory("localStorageService", ($state, appStateService) => {
    const service = {};

    /**
			 * find a {key,value} in an array of objects and return its index
			 * returns -1 if not found
			 * @param  {Array of Objects} _accounts
			 * @param  {String} _key
			 * @param  {String, Number, Boolean} _value
			 * @return {Number} Index of the found array element
			 */
    const findIndex = function(_accounts, _key, _value) {
        let index = -1;
        _accounts.forEach((el, i) => {
            if (_accounts[i][_key] === _value) {
                index = i;
            }
        });
        return index;
    };

    service.removeToken = function removeToken(token) {
        if (localStorage.hasOwnProperty("accounts")) {
            const accounts = JSON.parse(localStorage.accounts);
            const tokenIndex = findIndex(accounts, "token", token);
            if (tokenIndex > -1) {
                accounts.splice(tokenIndex);
                localStorage.accounts = JSON.stringify(accounts);
            }
        }
    };

    service.getDefaultToken = function() {
        if (localStorage.accounts && JSON.parse(localStorage.accounts) instanceof Array) {
            const accounts = JSON.parse(localStorage.accounts);
            const index = findIndex(accounts, "is_default", true);
            if (index > -1) {
                return accounts[index].token;
            }
        }
        return null;
    };

    return service;
});
