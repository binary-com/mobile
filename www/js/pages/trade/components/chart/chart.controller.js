/**
 * @name chart controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 08/29/2015
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.chart.controllers").controller("ChartController", Chart);

    Chart.$inject = ["$scope", "chartService", "websocketService", "proposalService"];

    function Chart($scope, chartService, websocketService, proposalService) {
        const vm = this;

        $scope.$on("$destroy", (e, value) => {
            websocketService.sendRequestFor.forgetTicks();
            chartService.destroy();
        });

        $scope.$on("proposal:open-contract", (e, contract, req_id) => {
            if (contract && proposalService.openContractId === req_id) {
                const contractId = contract.contract_id;

                if ((typeof contractId === "string" && !_.isEmpty(contractId)) || contractId) {
                    chartService.addContract({
                        startTime: contract.date_start + 1,
                        duration : parseInt(vm.proposal.duration),
                        type     :
                            vm.proposal.tradeType === "Higher/Lower"
                                ? `${contract.contract_type}HL`
                                : contract.contract_type,
                        selectedTick: vm.proposal.tradeType === "High/Low Ticks" ? vm.proposal.selected_tick : null,
                        barrier     : vm.proposal.barrier
                    });
                }
            }
        });

        $scope.$on("tick", (e, feed) => {
            if (feed && feed.echo_req.ticks_history === vm.proposal.symbol) {
                chartService.historyInterface.addTick(feed.tick);
            } else {
                websocketService.sendRequestFor.forgetStream(feed.tick.id);
            }
        });

        $scope.$on("history", (e, feed) => {
            if (feed && feed.echo_req.ticks_history === vm.proposal.symbol) {
                chartService.historyInterface.addHistory(feed.history);
            }
        });

        $scope.$on("candles", (e, feed) => {
            if (feed) {
                chartService.historyInterface.addCandles(feed.candles);
            }
        });

        $scope.$on("ohlc", (e, feed) => {
            if (feed) {
                chartService.historyInterface.addOhlc(feed.ohlc);
            }
        });

        $scope.$on("connection:ready", e => {
            sendTickHistoryRequest();
        });

        $scope.$watch(
            () => vm.proposal.symbol,
            (newValue, oldValue) => {
                if (vm.proposal.symbol) {
                    // && newValue !== oldValue){
                    sendTickHistoryRequest();
                }
            }
        );

        function init() {
            const chartId = "tradeChart";

            vm.chartDragLeft = chartService.dragLeft;
            vm.chartDragRight = chartService.dragRight;
            vm.chartTouch = chartService.dragStart;
            vm.chartRelease = chartService.dragEnd;
            vm.chartPinchIn = chartService.zoomOut;
            vm.chartPinchOut = chartService.zoomIn;
            vm.chartPinchStart = chartService.zoomStart;
            vm.chartPinchEnd = chartService.zoomEnd;

            chartService.drawChart(chartId);
            sendTickHistoryRequest();
        }

        function sendTickHistoryRequest() {
            if (_.isEmpty(vm.proposal.symbol)) {
                return;
            }

            const symbol = vm.proposal.symbol;
            websocketService.sendRequestFor.forgetTicks();
            websocketService.sendRequestFor.ticksHistory({
                ticks_history: symbol,
                end          : "latest",
                count        : chartService.getCapacity(),
                subscribe    : 1
            });
        }

        init();
    }
})();
