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
        .module('binary.pages.transaction-detail.controllers')
        .controller('TransactionDetailController', TransactionDetail);

    TransactionDetail.$inject = ['$scope', '$timeout', '$interval', '$state',
                                 'appStateService', 'websocketService'];

    function TransactionDetail($scope, $timeout, $interval, $state,
                               appStateService, websocketService) {
        var vm = this;

        vm.currency = sessionStorage.getItem('currency');

        vm.data = {};
        vm.data.id = sessionStorage.getItem('id');
        vm.data.extraParams = {
            'req_id': vm.data.id
        }
        vm.sendDetailsRequest = function() {
            if (appStateService.isLoggedin) {
                websocketService.sendRequestFor.openContract(vm.data.id, vm.data.extraParams);
            } else {
                $timeout(vm.sendDetailsRequest, 500);
            }
        };

        $scope.$on('proposal:open-contract', (e, proposal_open_contract, req_id) => {
            vm.proposalOpenContract = proposal_open_contract;
            vm.data.reqId = req_id;
            if (vm.data.reqId == vm.data.id) {
                $scope.$applyAsync(() => {
                    vm.contract = vm.proposalOpenContract;
                });
            }
        });

        vm.sendDetailsRequest();

    }
})();
