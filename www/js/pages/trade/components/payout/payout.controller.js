/**
 * @name payout controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.payout.controllers").controller("PayoutController", Payout);

    Payout.$inject = ["$scope", "appStateService", "proposalService"];

    function Payout($scope, appStateService, proposalService) {
        const vm = this;
        vm.amount = vm.proposal.amount;
        vm.isIOS = ionic.Platform.isIOS();
        vm.marketsClosed = false;

        setCurrecyPattern();

        $scope.$watch(
            () => vm.proposal.amount,
            (newVal, oldVal) => {
                if (newVal !== vm.amount) {
                    vm.amount = newVal;
                }
            }
        );

        $scope.$on("authorize", (e, account) => {
            setCurrecyPattern(account.currency);
        });

        vm.changePayoutType = () => {
            if (vm.proposal.basis === "payout") {
                vm.proposal.basis = "stake";
            } else {
                vm.proposal.basis = "payout";
            }
            proposalService.setPropertyValue("basis", vm.proposal.basis);
        };

        vm.changeAmount = () => {
            if (_.isEmpty(vm.amount) || vm.amount === "NaN" || Number(vm.amount) === 0) {
                vm.proposal.amount = vm.amount;
            } else {
                if (/^\.\d+$/.test(vm.amount)){
                    vm.amount = `0${vm.amount}`;
                }
                vm.proposal.amount = +vm.amount;
            }
            proposalService.setPropertyValue("amount", vm.proposal.amount);
        };

        vm.add = () => {
            vm.amount = Number(vm.amount) + 1;
        };

        vm.subtract = () => {
            vm.amount = Number(vm.amount) - 1 >= 1 ? Number(vm.amount) - 1 : 1;
        };

        vm.stopLongPress = () => {
            vm.proposal.amount = +vm.amount;
            proposalService.setPropertyValue("amount", vm.proposal.amount);
        };

        $scope.$on("symbols:updated", (e, openMarkets) => {
            if (_.isEmpty(openMarkets)) {
                vm.marketsClosed = true;
            } else {
                vm.marketsClosed = false;
            }
        });

        function init() {}

        function setCurrecyPattern(currency) {
            if(_.isEmpty(currency)){
                currency = sessionStorage.currency;
            }
            const currencyConfig = appStateService.currenciesConfig[currency];
            $scope.$applyAsync(() => {
                vm.regex = `^(\\d*\\.?\\d{0,${currencyConfig ? currencyConfig.fractional_digits : 2}})`;
                vm.amount =  new RegExp(vm.regex).exec(vm.amount)[0];
            });
            return vm.regex;
        }

        init();
    }
})();
