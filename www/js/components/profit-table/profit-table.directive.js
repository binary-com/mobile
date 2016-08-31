angular
	.module('binary')
	.directive('profitTable', [
		'appStateService',
		'websocketService',
		'$timeout',
		function(appStateService,
			websocketService,
			$timeout) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/profit-table/profit-table.template.html',
				link: function(scope, element, $location) {
					scope.data = {};
					scope.profitTableSet = false;
					scope.appID = 'allApps';
					scope.dateType = 'allTime';
					scope.itemsPerPage = 10;
					scope.itemsFirstCall = scope.itemsPerPage + 1;
					scope.currentPage = 0;
					scope.nextPageDisabled = true;
					scope.prevPageDisabled = true;
					scope.customDateEnabled = false;
					scope.transactions = [];
					scope.noTransaction = false;
					// function of sending profti table request through websocket
					scope.sendProfitTableRequest = function() {
						var params = {
							"limit": scope.itemsFirstCall,
							"offset": scope.currentPage * scope.itemsPerPage,
							"description": 1,
							"date_from": scope.dateFrom,
							"date_to": scope.dateTo
						}
						websocketService.sendRequestFor.profitTable(params);
					}

					// check if user is loggedin for preventing errors on page refresh
					// send request for profit table for the first time
					scope.firstProfitTableRequest = function() {
						if (appStateService.isLoggedin) {
							if (!scope.profitTableSet) {
								scope.currentPage = 0;
								scope.dateFrom = "";
								scope.dateTo = "";
								scope.sendProfitTableRequest();
							}
						} else {
							$timeout(scope.firstProfitTableRequest, 500);
						}
					}
					scope.firstProfitTableRequest();

					// previous button
					scope.prevPage = function() {
						if (scope.currentPage > 0) {
							scope.currentPage--;
						}
					};
					// next button
					scope.nextPage = function() {
						scope.currentPage++;
					};
					// set currentPage
					scope.setPage = function(n) {
						if (n > 0) {
							scope.currentPage = n;
						}
					};
					// watch currentPage for changing the pages via next or prev button
					// whenever changed send request for new data
					scope.$watch("currentPage", function(newValue, oldValue) {
						scope.currentPage = newValue;
						scope.sendProfitTableRequest();
					});

					scope.$watch("dateType", function() {
						scope.currentPage = 0;
						scope.transactions = [];
						scope.$applyAsync(function() {
							if (scope.dateType == 'customDate') {
								scope.customDateEnabled = true;
								scope.setCustomDate();
							} else {
								scope.customDateEnabled = false;
							}
						});

						if (scope.dateType == 'allTime') {
							scope.dateFrom = "";
							scope.dateTo = "";
						} else if (scope.dateType == 'monthAgo') {
							var now = new Date();
							var currentEpoch = now.getTime();
							var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
							var midnightEpoch = new Date(today).getTime();
							var diff = currentEpoch - midnightEpoch;
							var dayBeforeDate = now.setDate(now.getDate() - 30);
							scope.dateFrom = Math.ceil((dayBeforeDate - diff) / 1000);
							scope.dateTo = "";
						} else if (scope.dateType == 'sevenDayAgo') {
							var now = new Date();
							var currentEpoch = now.getTime();
							var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
							var midnightEpoch = new Date(today).getTime();
							var diff = currentEpoch - midnightEpoch;
							var dayBeforeDate = now.setDate(now.getDate() - 7);
							scope.dateFrom = Math.ceil((dayBeforeDate - diff) / 1000);
							scope.dateTo = "";
						} else if (scope.dateType == 'threeDayAgo') {
							var now = new Date();
							var currentEpoch = now.getTime();
							var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
							var midnightEpoch = new Date(today).getTime();
							var diff = currentEpoch - midnightEpoch;
							var dayBeforeDate = now.setDate(now.getDate() - 3);
							scope.dateFrom = Math.ceil((dayBeforeDate - diff) / 1000);
							scope.dateTo = "";
						} else if (scope.dateType == 'oneDayAgo') {
							var now = new Date();
							var currentEpoch = now.getTime();
							var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
							var midnightEpoch = new Date(today).getTime();
							var diff = currentEpoch - midnightEpoch;
							var dayBeforeDate = now.setDate(now.getDate() - 1);
							scope.dateFrom = Math.ceil((dayBeforeDate - diff) / 1000);
							scope.dateTo = "";
						}

						scope.sendProfitTableRequest();
					});

					scope.setCustomDate = function() {
						scope.currentPage = 0;
						if (scope.startFrom && scope.endTo) {
							var startDate = document.getElementById("datefrom").value;
							startDate = new Date(startDate).getTime() / 1000;
							var finishDate = document.getElementById("dateto").value;
							finishDate = new Date(finishDate).getTime() / 1000;
						}
						scope.dateFrom = startDate || "";
						scope.dateTo = finishDate || "";
						scope.sendProfitTableRequest();
					}

					// do this on response of any profitTable request
					scope.$on('profit_table:update', function(e, _profitTable, _passthrough) {
						scope.transactions.length = 0;
						scope.profitTableSet = true;
						scope.profitTable = _profitTable;
						scope.count = scope.profitTable.count;
						if (scope.count > 0) {
							scope.$applyAsync(function() {
								scope.noTransaction = false;

							});
							scope.items = scope.profitTable.transactions;
							// enable and disabling previous button
							if (scope.currentPage == 0) {
								scope.$applyAsync(function() {
									scope.prevPageDisabled = true;
								});
							} else if (scope.currentPage != 0) {
								scope.$applyAsync(function() {
									scope.prevPageDisabled = false;
								});
							}
							// check if there are still more to show
							if (scope.count < scope.itemsFirstCall) {
								scope.transactions = scope.items;
								scope.$applyAsync(function() {
									scope.nextPageDisabled = true;
								});
							}
							// check if there are no more transaction to show
							else {
								scope.items.forEach(function(el, i) {
									if (i < scope.count - 1) {
										scope.transactions.push(scope.items[i]);
										scope.$applyAsync(function() {
											scope.nextPageDisabled = false;
										});
									}
								});
							}
						} else {
							scope.$applyAsync(function() {
								scope.noTransaction = true;

							});
						}
					});

					// details functions
					// scope.sendContractDetailRequest = function(id){
					// 	scope.id = id;
					// 	websocketService.sendRequestFor.openContract(scope.id);
					// }
					// scope.$on('proposal:open-contract', function(e, proposal_open_contract){
					// 	scope.proposalOpenContract = proposal_open_contract;
					//
					// });

				}
			}
		}
	]);
