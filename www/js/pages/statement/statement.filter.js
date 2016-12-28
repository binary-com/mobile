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
	.module('binary.pages.statement.filters')
	.filter('StatementDataFilter', StatementDataFilter);

	StatementDataFilter.$inject = ['$filter'];

		function StatementDataFilter(transactions, appID) {
			function DataChange(transactions, appID){
				var filtered = [],
				appID = appID,
				transactions = transactions;
				for (var i in transactions) {
					var item = transactions[i];
					var itemId = item.app_id;
					if(appID == 'allApps' || ((appID == 'tickTradeApp') && itemId === '10')){
						filtered.push(item);
					}
				};
				return filtered;
			}
			return DataChange;
		};
		return StatementDataFilter;
})();
