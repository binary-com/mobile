angular
	.module('binary')
	.directive('profitTable', [
		'appStateService',
		'websocketService',
		function(appStateService,
			websocketService) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/profit-table/profit-table.template.html',
				link: function(scope, element, $location) {
					scope.data = {};
					scope.profitTableSet = false;
					scope.appID = 'allApps';
					scope.dateType = 'allTime';
					scope.itemsPerPage = 5;
					scope.itemsFirstCall = scope.itemsPerPage + 1;
					scope.currentPage = 0;
					scope.nextPageDisabled = true;
					scope.prevPageDisabled = true;
					scope.transactions = [];
					if (!scope.profitTableSet) {
						var params = {
							"limit": scope.itemsFirstCall,
							"description": 1
						}
						websocketService.sendRequestFor.profitTable(params);
					}

					scope.prevPage = function() {
						if (scope.currentPage > 0) {
							scope.currentPage--;
						}
					};

					scope.nextPage = function() {
						scope.currentPage++;
					};

					scope.setPage = function(n) {
						if (n > 0) {
							scope.currentPage = n;
						}
					};

					scope.$watch("currentPage", function(newValue, oldValue) {
						var params = {
							"description": 1,
							"limit": scope.itemsFirstCall,
							"offset": newValue * scope.itemsPerPage
						}
						websocketService.sendRequestFor.profitTable(params);
					});


					scope.$on('profit_table:update', function(e, _profitTable, _passthrough) {
						scope.transactions.length = 0;
						scope.profitTableSet = true;
						scope.profitTable = _profitTable;
						scope.items = scope.profitTable.transactions;
						scope.count = scope.profitTable.count;
						if (scope.currentPage == 0) {
							scope.$applyAsync(function() {
								scope.prevPageDisabled = true;
							});
						} else if (scope.currentPage != 0) {
							scope.$applyAsync(function() {
								scope.prevPageDisabled = false;
							});
						}
						if (scope.count < scope.itemsFirstCall) {
							scope.transactions = scope.items;
							scope.$applyAsync(function() {
								scope.nextPageDisabled = true;
							});
						} else {
							scope.items.forEach(function(el, i) {
								if (i < scope.count - 1) {
									scope.transactions.push(scope.items[i]);
									scope.$applyAsync(function() {
										scope.nextPageDisabled = false;
									});
								}
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
