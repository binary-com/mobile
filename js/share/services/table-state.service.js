/**
 * @name tableStateService
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 05/02/2016
 * @copyright Binary Ltd
 * Keeping state of the app in this factory
 */

angular.module("binary").factory("tableStateService", () => {
    const factory = {};
    factory.dateType = "allTime";
    factory.dateFrom = "";
    factory.dateTo = "";
    factory.currentPage = 0;
    factory.appID = "allApps";
    factory.batchNum = 0;
    factory.batchLimit = 0;
    factory.batchSize = 20;
    factory.completedGroup = true;
    factory.statementDateType = "allTime";
    factory.statementDateFrom = "";
    factory.statementDateTo = "";
    factory.statementCurrentPage = 0;
    factory.statementAppID = "allApps";
    factory.statementBatchNum = 0;
    factory.statementBatchLimit = 0;
    factory.statementBatchSize = 20;
    factory.statementCompletedGroup = true;

    return factory;
});
