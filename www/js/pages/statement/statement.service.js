/**
 * @name statement serivce
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
        'use strict';

        angular
            .module('binary.pages.statement.services')
            .factory('statementService', Statement);
        Statement.$inject = [];

        function Statement() {
            var factory = {};
            var createStatement = function(_data) {
                var statementState = {
                    dateType: _data.dateType || 'allTime',
                    dateFrom: _data.dateFrom || "",
                    dateTo: _data.dateTo || "",
                    currentPage: _data.currentPage || 0,
                    appID: _data.appID || 'allApps'
                    }
                return statementState;
            }
            factory.update = function(_data) {
                if (_data) {
                    sessionStorage.statementState = JSON.stringify(createStatement(_data));
                }
            }

            factory.get = function() {
                if (sessionStorage.statementState) {
                    return JSON.parse(sessionStorage.statementState);
                }
                return false;
            };

            factory.remove = function() {
                sessionStorage.removeItem('statementState');
            }
            return factory;
        }

})();
