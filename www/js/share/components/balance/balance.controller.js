/**
 * @name balance controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.balance.controllers").controller("BalanceController", Balance);

    Balance.$inject = ["$scope", "appStateService", "websocketService"];

    function Balance($scope, appStateService, websocketService) {
        const vm = this;
        vm.balance = null;

        $scope.$on("authorize", (e, response, requestId, pathtrough) => {
            $scope.$applyAsync(() => {
                vm.balance = {
                    currency: response.currency,
                    balance : response.balance,
                    loginid : response.loginid
                };
                sessionStorage.setItem("balance", vm.balance.balance);

                getBalance();
            });
        });

        $scope.$on("balance", (e, response) => {
            $scope.$applyAsync(() => {
                vm.balance = response;
                appStateService.balanceSubscribtionId = response.id || null;
            });
        });

        $scope.$on("language:updated", e => {
            websocketService.sendRequestFor.forgetAll("balance");
            vm.balance = null;
            getBalance();
        });

        function getBalance() {
            websocketService.sendRequestFor.balance();
        }

        $scope.$on('currency:changed', (e, currency) => {
            getBalance();
            vm.balance.currency = currency;
        });

        getBalance();
    }
})();
