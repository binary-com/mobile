// angular
// 	.module('binary')
// 	.filter('dataFilter', ["$filter", function($filter) {
// 		return function(transactions, appID, dateType, dateFrom, dateTo) {
// 			var filtered = [],
// 			customDate = customDate,
// 			dateFrom = dateFrom,
// 			dateTo = dateTo,
// 			appID = appID,
// 			dateType = dateType;
//
// 			for (var i in transactions) {
// 				var item = transactions[i];
// 				var purchaseTime = item.purchase_time * 1000;
// 				var sellTime = item.sell_time * 1000;
// 				var itemId = item.app_id;
//
// 				if(dateType == 'allTime' && (appID == 'allApps' || ((appID == 'tickTradeApp') && itemId == 10))){
// 					filtered.push(item);
// 				}	else if (dateType == 'customDate') {
// 					if (dateFrom && dateTo) {
// 						var startDate = document.getElementById("datefrom").value;
// 						startDate = new Date(startDate).getTime();
// 						var finishDate = document.getElementById("dateto").value;
// 						finishDate = new Date(finishDate).getTime();
// 						if (startDate <= purchaseTime && sellTime <= finishDate) {
// 							filtered.push(item);
// 						}
// 					}
// 				} else if (dateType == 'oneDayAgo' && (appID == 'allApps' || (appID == 'tickTradeApp' && itemId == 10))) {
// 					var now = new Date();
// 					var current = now.getTime();
// 					var dayBeforeDate = now.setDate(now.getDate() - 1);
// 					if (dayBeforeDate <= purchaseTime) {
// 						filtered.push(item);
// 					}
//
// 				} else if (dateType == 'threeDayAgo' && (appID == 'allApps' || (appID == 'tickTradeApp' && itemId == 10))) {
// 					var now = new Date();
// 					var current = now.getTime();
// 					var dayBeforeDate = now.setDate(now.getDate() - 3);
// 					if (dayBeforeDate <= purchaseTime) {
// 						filtered.push(item);
// 					}
//
// 				} else if (dateType == 'sevenDayAgo' && (appID == 'allApps' || (appID == 'tickTradeApp' && itemId == 10))) {
// 					var now = new Date();
// 					var current = now.getTime();
// 					var dayBeforeDate = now.setDate(now.getDate() - 7);
// 					if (dayBeforeDate <= purchaseTime) {
// 						filtered.push(item);
// 					}
//
// 				} else if (dateType == 'monthAgo' && (appID == 'allApps' || (appID == 'tickTradeApp' && itemId == 10))) {
// 					var now = new Date();
// 					var current = now.getTime();
// 					var dayBeforeDate = now.setDate(now.getDate() - 30);
// 					if (dayBeforeDate <= purchaseTime) {
// 						filtered.push(item);
// 					}
//
// 				}
// 			}
//
//
// 			return filtered;
// 		};
// 	}]);
