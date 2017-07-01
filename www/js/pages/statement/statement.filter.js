/**
 * @name profit-table filter
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.statement.filters").filter("StatementDataFilter", StatementDataFilter);

    StatementDataFilter.$inject = ["$filter"];

    function StatementDataFilter(transactions, appID, appIdAllowed) {
        function DataChange(transactions, appID, appIdAllowed) {
            var filtered = [],
                appID = appID,
                appIdAllowed = appIdAllowed,
                transactions = transactions;
            for (const i in transactions) {
                const item = transactions[i];
                const itemId = item.app_id;
                if (appID == "allApps" || (appID == "tickTradeApp" && itemId === appIdAllowed)) {
                    filtered.push(item);
                }
            }
            return filtered;
        }
        return DataChange;
    }
    return StatementDataFilter;
})();
