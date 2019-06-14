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
        vm.fractionalLength = 2;
        const activeSymbols = JSON.parse(sessionStorage.getItem("all_active_symbols"));
        const id = sessionStorage.getItem("id");
        const contractId = parseInt(id);
        const extraParams = {
            req_id: contractId
        };

        const getFractionalLength =  (floatNumber) => {
            const stringNumber = floatNumber.toString();
            const decimalLength = stringNumber.indexOf(".");
            return stringNumber.length - decimalLength - 1;
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

            if (reqId === contractId) {
                const activeSymbol =
                    activeSymbols.find((activeSymbol) => activeSymbol.symbol === proposalOpenContract.underlying);
                const pip = activeSymbol.pip || 0.01;
                vm.fractionalLength = getFractionalLength(pip);
                vm.contract = proposalOpenContract;
                $scope.$apply();

            }
        });

        sendDetailsRequest();
    }
})();
