/**
 * @name profit-table filter
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.profit-table.filters").filter("DataFilter", DataFilter);

    DataFilter.$inject = ["$filter"];

    function DataFilter(transactions, appID, appIdAllowed) {
        function DataChange(transactions, appID, appIdAllowed) {
            const filtered = [];

            transactions.forEach((value, i) => {
                const item = transactions[i];
                const itemId = item.app_id;
                if (appID === "allApps" || (appID === "tickTradeApp" && itemId === appIdAllowed.toString())) {
                    filtered.push(item);
                }
            });
            return filtered;
        }
        return DataChange;
    }
})();
