/**
 * @name profit-table service
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
        'use strict';

        angular
            .module('binary.pages.profit-table.services')
            .factory('profitTableService', ProfitTable);
        ProfitTable.$inject = [];

        function ProfitTable() {
            var factory = {};
            var createProfitTable = function(_data) {
                var profitTableState = {
                    dateType: _data.dateType || 'allTime',
                    dateFrom: _data.dateFrom || "",
                    dateTo: _data.dateTo || "",
                    currentPage: _data.currentPage || 0,
                    appID: _data.appID || 'allApps'
                    }
                return profitTableState;
            }
            factory.update = function(_data) {
                if (_data) {
                    sessionStorage.profitTableState = JSON.stringify(createProfitTable(_data));
                }
            }

            factory.get = function() {
                if (sessionStorage.profitTableState) {
                    return JSON.parse(sessionStorage.profitTableState);
                }
                return false;
            };

            factory.remove = function() {
                sessionStorage.removeItem('profitTableState');
            }
            return factory;
        }

})();
