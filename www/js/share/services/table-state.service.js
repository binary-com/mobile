/**
 * @name tableStateService
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/02/2016
 * @copyright Binary Ltd
 * Keeping state of the app in this factory
 */

angular
    .module('binary')
    .factory('tableStateService',
            function(){
                var factory = {};
                factory.dateType = 'allTime';
                factory.dateFrom = '';
                factory.dateTo = '';
                factory.currentPage = 0;
                factory.appID = 'allApps';
                factory.statementDateType = 'allTime';
                factory.statementDateFrom = '';
                factory.statementDateTo = '';
                factory.statementCurrentPage = 0;
                factory.statementAppID = 'allApps';
                factory.batchNum = 0;
                factory.batchLimit = 0;
                factory.batchSize = 20;
                factory.completedGroup = true;


                return factory;
            });
