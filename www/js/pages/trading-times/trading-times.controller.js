/**
 * @name Trading Times controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/24/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trading-times.controllers").controller("TradingTimesController", TradingTimes);

    TradingTimes.$inject = ["$scope", "$filter", "websocketService"];

    function TradingTimes($scope, $filter, websocketService) {
        const vm = this;
        vm.isDataLoaded = false;
        vm.data = {};
        vm.hasError = false;
        vm.now = Math.round(new Date().getTime());
        angular.element(document).ready(() => {
            document.getElementById("date").setAttribute("min", $filter("date")(vm.now, "yyyy-MM-dd"));
            document.getElementById("date").value = $filter("date")(vm.now, "yyyy-MM-dd");
        });

        vm.sendTradingTimes = () => {
            vm.epochDate = vm.data.date || Math.round(new Date().getTime());
            vm.date = $filter("date")(vm.epochDate, "yyyy-MM-dd");
            websocketService.sendRequestFor.tradingTimes(vm.date);
        };

        vm.sendTradingTimes();

        $scope.$on("trading_times:success", (e, trading_times) => {
            vm.tradingTimes = trading_times;
            vm.marketDisplayNames = [];
            const allActiveSymbols = JSON.parse(sessionStorage.getItem('all_active_symbols'));
            vm.activeSymbols = _.groupBy(allActiveSymbols, "market");
            Object.values(vm.activeSymbols).forEach((market, j) => {
                if (!vm.marketDisplayNames.market) vm.marketDisplayNames.push(market[0].market_display_name);
            });
            $scope.$applyAsync(() => {
                vm.hasError = false;
	            vm.data.markets = _.filter(vm.tradingTimes.markets, market =>
                    vm.marketDisplayNames.indexOf(market.name) > -1
                );
                vm.market = vm.data.markets[0].name;
                vm.isDataLoaded = true;
            });
        });

        $scope.$on("trading_times:error", (e, error) => {
            $scope.$applyAsync(() => {
                vm.isDataLoaded = true;
                vm.hasError = true;
                vm.error = error;
            });
        });

        vm.getTranslationId = title => {
            if (title === "Closes early (at 21:00)" || title === "Closes early (at 18:00)") {
                return `trading-times.${title.replace(/[\s]/g, '_').toLowerCase()}`;
            }
            return title;
        }

    }
})();
