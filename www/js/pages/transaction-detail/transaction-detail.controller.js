/**
 * @name transaction-detail controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.profit-table.controllers')
        .controller('TransactionDetailController', TransactionDetail);

    TransactionDetail.$inject = ['$scope', 'appStateService', 'websocketService', '$timeout'];

    function TransactionDetail($scope, appStateService, websocketService, $timeout) {
        var vm = this;
        vm.data = {};
				vm.data.id = localStorage.getItem('id');
				vm.data.extraParams = {
					'req_id': vm.data.id
				}
				vm.sendDetailsRequest = function(){
					if(appStateService.isLoggedin){
						websocketService.sendRequestFor.openContract(vm.data.id, vm.data.extraParams);
						$scope.$on('proposal:open-contract', function(e, proposal_open_contract, req_id) {
							vm.proposalOpenContract = proposal_open_contract;
							vm.data.reqId = req_id;
							if (vm.data.reqId == vm.data.id) {
                $scope.$applyAsync(function(){
								vm.contract = vm.proposalOpenContract;
								});
							}
						});
					}
					else{
						$timeout(vm.sendDetailsRequest, 500);
					}
				};

				vm.sendDetailsRequest();

			}
		})();
