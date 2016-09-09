(function() {
		'use strict';

angular
	.module('binary.pages.profit-table.filters')
	.filter('DataFilter', DataFilter);

	DataFilter.$inject = ['$filter'];

		function DataFilter(transactions, appID) {
			function DataChange(transactions, appID){
				var filtered = [],
				appID = appID,
				transactions = transactions;
				for (var i in transactions) {
					var item = transactions[i];
					// var purchaseTime = item.purchase_time * 1000;
					// var sellTime = item.sell_time * 1000;
					var itemId = item.app_id;
					if(appID == 'allApps' || ((appID == 'tickTradeApp') && itemId == 10)){
						filtered.push(item);
					}
				};
				return filtered;
			}
			return DataChange;
		};
})();
