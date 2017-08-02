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

        vm.changePayoutType = function() {
            if (vm.proposal.basis === "payout") {
                vm.proposal.basis = "stake";
            } else {
                vm.proposal.basis = "payout";
            }
            proposalService.setPropertyValue("basis", vm.proposal.basis);
        };

        vm.changeAmount = function() {
            if (_.isEmpty(vm.amount) || vm.amount === "NaN" || Number(vm.amount) === 0) {
                vm.proposal.amount = vm.amount;
            } else {
                if (/^.\d+$/.test(vm.amount)){
                    vm.amount = `0${vm.amount}`;
                }
                vm.proposal.amount = vm.amount;
            }
            proposalService.setPropertyValue("amount", vm.proposal.amount);
        };

        vm.add = function() {
            vm.amount = Number(vm.amount) + 1 <= 10000 ? Number(vm.amount) + 1 : 100000;
        };

        vm.subtract = function() {
            vm.amount = Number(vm.amount) - 1 >= 1 ? Number(vm.amount) - 1 : 1;
        };

        vm.stopLongPress = function() {
            vm.proposal.amount = vm.amount;
            proposalService.setPropertyValue("amount", vm.proposal.amount);
        };

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
