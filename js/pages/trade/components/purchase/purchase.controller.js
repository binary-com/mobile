/**
 * @name purchase controller
 * @author morteza tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright binary ltd
 */

(function () {
    angular.module("binary.pages.trade.components.purchase.controllers").controller("PurchaseController", Purchase);

    Purchase.$inject = [
        "$scope",
        "$timeout",
        "analyticsService",
        "accountService",
        "appStateService",
        "proposalService",
        "websocketService",
        "chartService",
        "$ionicLoading"
    ];

    function Purchase($scope,
        $timeout,
        analyticsService,
        accountService,
        appStateService,
        proposalService,
        websocketService,
        chartService,
        $ionicLoading) {
        const vm = this;
        let forgetRequestId = 0;

        vm.longcode = [];
        vm.contracts = [];
        vm.proposalResponses = [];
        vm.inPurchaseMode = false;
        vm.showSummary = false;
        vm.purchasedContractIndex = -1;
        vm.currencyType = "fiat";
        vm.isContractFinished = false;
        vm.contractType = '';

        $scope.$watch(
            () => vm.proposal,
            (newValue, oldValue) => {
                if (_.isEqual(newValue, oldValue) && vm.proposalResponses.length > 0) {
                    return;
                }

                if (vm.proposalResponses.length > 0) {
                    $scope.$applyAsync(() => {
                        vm.proposalResponses[0].isReceiving = true;
                        vm.proposalResponses[1].isReceiving = true;
                    });
                }

                const currencyConfig = appStateService.currenciesConfig[vm.proposal.currency];
                if (currencyConfig) {
                    vm.currencyType = currencyConfig.type;
                }

                proposalUpdated();
            },
            true
        );

        $scope.$on("appState:tradeMode", e => {
            vm.showSummary = !appStateService.tradeMode;
        });

        $scope.$on("proposal", (e, proposal, reqId) => {
            if ([1, 2].indexOf(reqId) > -1) {
                $scope.$applyAsync(() => {
                    vm.proposalResponses[reqId - 1] = proposal;
                    vm.proposalResponses[reqId - 1].hasError = false;
                    vm.proposalResponses[reqId - 1].isReceiving = false;
                    vm.longcode[reqId - 1] = proposal.longcode;
                });
            }

            if (vm.isContractFinished) {
                // Unlock view to navigate
                appStateService.purchaseMode = false;
                vm.inPurchaseMode = false;
            }

        });

        $scope.$on("proposal:error", (e, error, reqId) => {
            if ([1, 2].indexOf(reqId) > -1 && error.code !== "AlreadySubscribed") {
                $scope.$applyAsync(() => {
                    vm.proposalResponses[reqId - 1] = error;
                    vm.proposalResponses[reqId - 1].hasError = true;
                });
                $timeout(vm.autoSizeText, 1000);
            }
        });

        $scope.$on("purchase", (e, response) => {
            const purchaseInfo = response.buy;

            if (!_.isEmpty(response.buy)) {
                vm.showSummary = true;
                $scope.$applyAsync(() => {
                    vm.purchasedContract = {
                        contractId   : purchaseInfo.contract_id,
                        longcode     : purchaseInfo.longcode,
                        payout       : vm.proposalResponses[vm.purchasedContractIndex].payout,
                        cost         : purchaseInfo.buy_price,
                        balance      : purchaseInfo.balance_after,
                        transactionId: purchaseInfo.transaction_id,
                        profit       : parseFloat(vm.proposalResponses[vm.purchasedContractIndex].payout) -
                        parseFloat(purchaseInfo.buy_price),
                    };
                });
                chartService.addContract({
                    startTime: purchaseInfo.start_time + 1,
                    duration : parseInt(vm.proposal.duration),
                    type     :
                        vm.proposal.tradeType === "Higher/Lower"
                            ? `${vm.contractType}HL`
                            : vm.contractType,
                    selectedTick: vm.proposal.tradeType === "High/Low Ticks" ? vm.proposal.selected_tick : null,
                    barrier     : vm.proposal.barrier
                });
            }
        });

        $scope.$on("purchase:error", (e, error) => {
            vm.inPurchaseMode = false;
            vm.showSummary = false;
            appStateService.tradeMode = true;
            appStateService.purchaseMode = false;
            vm.purchasedContractIndex = -1;
            sendProposal();
        });

        $scope.$on("contract:finished", (e, contract) => {
            if (contract.exitSpot) {
                if (contract.result === "win") {
                    vm.purchasedContract.buyPrice = vm.purchasedContract.cost;
                    vm.purchasedContract.profit = vm.purchasedContract.profit;
                    vm.purchasedContract.finalPrice =
                        parseFloat(vm.purchasedContract.buyPrice) + parseFloat(vm.purchasedContract.profit);
                    websocketService.sendRequestFor.openContract();
                } else if (contract.result === "lose") {
                    vm.purchasedContract.buyPrice = vm.purchasedContract.cost;
                    vm.purchasedContract.loss = vm.purchasedContract.cost;
                    vm.purchasedContract.finalPrice =
                        parseFloat(vm.purchasedContract.buyPrice) + parseFloat(vm.purchasedContract.loss);
                }
                vm.purchasedContract.result = contract.result === "lose" ? "loss" : contract.result;

                const proposal = vm.contracts[vm.purchasedContractIndex];

                // Send statistic to Google Analytics
                analyticsService.google.trackEvent(
                    proposal.market,
                    proposal.contract_type,
                    proposal.underlying_symbol,
                    vm.purchasedContract.payout
                );

                vm.isContractFinished = true;
                sendProposal();
            }
        });

        $scope.$on("forget_all", (e, req_id) => {
            if (req_id !== forgetRequestId) {
                return;
            }
            const proposal1 = _.clone(vm.proposal);
            proposal1.contract_type = vm.contracts[0].contract_type;
            proposal1.req_id = 1;

            const proposal2 = _.clone(vm.proposal);
            proposal2.contract_type = vm.contracts[1].contract_type;
            proposal2.req_id = 2;

            if (vm.proposalResponses.length > 0) {
                $scope.$applyAsync(() => {
                    vm.proposalResponses[0].isReceiving = proposalService.send(proposal1);
                    vm.proposalResponses[1].isReceiving = proposalService.send(proposal2);
                });
            } else {
                proposalService.send(proposal1);
                proposalService.send(proposal2);
            }
        });

        $scope.$on("$destroy", e => {
            proposalService.forget();
        });

        vm.getImageUrl = function (contractType) {
            return `img/trade-icon/${contractType.toLowerCase()}.svg`;
        };

        vm.purchase = function (contractIndex, contract_type) {
            $scope.$applyAsync(() => {
                vm.isContractFinished = false;
                vm.inPurchaseMode = true;
                vm.purchasedContractIndex = contractIndex;
                appStateService.purchaseMode = true;
                appStateService.tradeMode = false;
            });
            if (contract_type) {
                vm.contractType = contract_type;
            }
            proposalService.purchase(vm.proposalResponses[contractIndex]);
        };

        vm.backToTrade = function () {
            vm.showSummary = false;
            appStateService.tradeMode = true;
            appStateService.purchaseMode = false;
            vm.purchasedContractIndex = -1;
        };

        vm.showLongcode = id =>
            $ionicLoading.show({template: vm.longcode[id], noBackdrop: true, duration: 2500});

        function init() {
            vm.user = accountService.getDefault();
            if (_.isEmpty(vm.contracts)) {
                setTimeout(init, 500);
            }
            // sendProposal();
        }

        function sendProposal() {
            forgetRequestId = new Date().getTime();

            proposalService.forget(forgetRequestId);

            // Proposal will be sent when the result of proposal-forget received. Lines:141-156
            // This changes has been done to prevent subscribtion issue
            // `You're already subscribed`
        }

        function proposalUpdated() {
            if (!_.isEmpty(sessionStorage.tradeTypes)) {
                const tradeTypes = JSON.parse(sessionStorage.tradeTypes);
                vm.contracts = tradeTypes[vm.proposal.tradeType];

                if (!_.isEmpty(vm.contracts) && vm.contracts[0].underlying_symbol === vm.proposal.symbol) {
                    sendProposal();
                }
            } else {
                setTimeout(proposalUpdated, 5);
            }
        }

        vm.autoSizeText = () => {
            let el;
            let _i;
            let _len;
            const _results = [];
            const elements = document.getElementsByClassName("resize");
            if (elements.length < 0) {
                return null;
            }
            for (_i = 0, _len = elements.length; _i < _len; _i++) {
                el = elements[_i];
                _results.push(
                    ((el) => {
                        const _results1 = [];
                        const resizeText = function () {
                            const elNewFontSize = `${parseInt($(el).css("font-size").slice(0, -2)) - 1}px`;
                            return $(el).css("font-size", elNewFontSize);
                        };
                        while (el.scrollHeight > el.offsetHeight) {
                            _results1.push(resizeText());
                        }
                        return _results1;
                    })(el)
                );
            }
            return _results;
        };

        init();
    }
})();
