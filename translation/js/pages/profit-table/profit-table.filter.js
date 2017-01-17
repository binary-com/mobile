/**
 * @name profit-table filter
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */




(function() {
		'use strict';

angular
	.module('binary.pages.profit-table.filters')
	.filter('DataFilter', DataFilter);

	DataFilter.$inject = ['$filter'];

		function DataFilter(transactions, appID, appIdAllowed) {
			function DataChange(transactions, appID, appIdAllowed){
				var filtered = [],
				appID = appID,
				appIdAllowed = appIdAllowed,
				transactions = transactions;
				for (var i in transactions) {
					var item = transactions[i];
					var itemId = item.app_id;
					if(appID == 'allApps' || ((appID == 'tickTradeApp') && itemId === appIdAllowed)){
						filtered.push(item);
					}
				};
				return filtered;
			}
			return DataChange;
		};
		return DataFilter;
})();
