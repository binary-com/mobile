/**
 * @name transaction-detail controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.pages.transaction-detail.controllers")
        .controller("TransactionDetailController", TransactionDetail);

    TransactionDetail.$inject = ["$scope", "$timeout", "appStateService", "websocketService"];

    function TransactionDetail($scope, $timeout, appStateService, websocketService) {
        const vm = this;
        vm.currency = sessionStorage.getItem("currency");
        const id = sessionStorage.getItem("id");
        const extraParams = {
            req_id: id
        };
        const sendDetailsRequest = () => {
            if (appStateService.isLoggedin) {
                websocketService.sendRequestFor.openContract(id, extraParams);
            } else {
                $timeout(sendDetailsRequest, 500);
            }
        };

        $scope.$on("proposal:open-contract", (e, proposal_open_contract, req_id) => {
            const proposalOpenContract = proposal_open_contract;
            const reqId = req_id;
            if (reqId === id) {
                $scope.$applyAsync(() => {
                    vm.contract = proposalOpenContract;
                });
            }
        });

        sendDetailsRequest();
    }
})();
