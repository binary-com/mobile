/**
 * @name Trading Times controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/24/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trading-times.controllers").controller("TradingTimesController", TradingTimes);

    TradingTimes.$inject = ["$scope", "$filter", "websocketService", "marketService"];

    function TradingTimes($scope, $filter, websocketService, marketService) {
        const vm = this;
        vm.data = {};
        vm.hasError = false;
        vm.now = Math.round(new Date().getTime());
        angular.element(document).ready(() => {
            document.getElementById("date").setAttribute("min", $filter("date")(vm.now, "yyyy-MM-dd"));
            document.getElementById("date").value = $filter("date")(vm.now, "yyyy-MM-dd");
        });

        vm.sendTradingTimes = function() {
            vm.epochDate = vm.data.date || Math.round(new Date().getTime());
            vm.date = $filter("date")(vm.epochDate, "yyyy-MM-dd");
            websocketService.sendRequestFor.tradingTimes(vm.date);
        };

        vm.sendTradingTimes();

        $scope.$on("trading_times:success", (e, trading_times) => {
            vm.tradingTimes = trading_times;
            vm.marketDisplayNames = [];
            vm.activeSymbols = JSON.parse(sessionStorage.getItem('active_symbols'));
            Object.values(vm.activeSymbols).forEach((market, j) => {
                if (!vm.marketDisplayNames.market) vm.marketDisplayNames.push(market[0].market_display_name);
            });
            $scope.$applyAsync(() => {
                vm.hasError = false;
	              vm.data.markets = vm.tradingTimes.markets.filter((market) => {
	                  return vm.marketDisplayNames.includes(market.name);
                });
                vm.market = vm.data.markets[0].name;
            });
        });

        $scope.$on("trading_times:error", (e, error) => {
            $scope.$applyAsync(() => {
                vm.hasError = true;
                vm.error = error;
            });
        });

        vm.getTranslationId = function (title) {
            if( title === "Closes early (at 21:00)" || title === "Closes early (at 18:00)") {
                return `trading-times.${title.replace(/[\s]/g, '_').toLowerCase()}`;
            }
            return title;
        }

    }
})();
