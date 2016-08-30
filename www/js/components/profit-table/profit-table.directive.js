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
				link: function(scope, element) {
					scope.data = {};
					scope.profitTableSet = false;
					scope.appID = 'allApps';
					scope.dateType = 'allTime';

					var params = {
						"description" : 1
					}
					websocketService.sendRequestFor.profitTable(params);
					scope.$on('profit_table:update', function(e, _profitTable, _passthrough){
						if(!scope.profitTableSet){
							scope.profitTableSet = true;
							scope.profitTable = _profitTable;
							scope.transactions = scope.profitTable.transactions;
						}
					});


					scope.sendContractDetailRequest = function(id){
						scope.id = id;
						websocketService.sendRequestFor.openContract(scope.id);
					}
					scope.$on('proposal:open-contract', function(e, proposal_open_contract){
						scope.proposalOpenContract = proposal_open_contract;

					});


				}
			}
		}
	]);
