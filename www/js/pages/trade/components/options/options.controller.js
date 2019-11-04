/**
 * @name options controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/21/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.controllers").controller("OptionsController", Options);

    Options.$inject = [
        "$scope",
        "$ionicModal",
        "marketsService",
        "optionsService",
        "proposalService",
        "tradeService",
        "tradeTypesService",
        "websocketService",
        "appStateService"
    ];

    function Options(
        $scope,
        $ionicModal,
        marketsService,
        optionsService,
        proposalService,
        tradeService,
        tradeTypesService,
        websocketService,
        appStateService
    ) {
        const vm = this;

        vm.showOptions = false;
        vm.marketsClosed = false;

        vm.SECTIONS = {
            OVERVIEW1   : 0,
            OVERVIEW2   : 1,
            UNDERLYINGS : 2,
            MARKETS     : 3,
            TRADETYPES  : 4,
            TICKS       : 5,
            DIGITS      : 6,
            SELECTEDTICK: 7
        };

        vm.options = {
            market       : null,
            underlying   : null,
            tradeType    : null,
            tick         : null,
            digit        : null,
            selected_tick: null
        };

        vm.section1 = vm.SECTIONS.OVERVIEW1; // vm.options.market ? vm.SECTIONS.OVERVIEW : vm.SECTIONS.MARKETS;
        vm.section2 = vm.SECTIONS.OVERVIEW2;

        $scope.$on("symbols:updated", (e, openMarkets) => {
            if (_.isEmpty(openMarkets)) {
                vm.showOptions = false;
                vm.marketsClosed = true;
                vm.proposal = {};
            } else {
                vm.showOptions = true;
                websocketService.sendRequestFor.assetIndex();
            }
        });

        $scope.$on("assetIndex:updated", e => {
            const markets = marketsService.findTickMarkets();
            vm.marketsLength = markets ? _.keys(markets).length : 0;
            if (!_.isEmpty(vm.options.market) && _.find(markets, ["displayName", vm.options.market.displayName])) {
                vm.selectMarket(vm.options.market);
            } else {
                vm.selectMarket(marketsService.getMarketByIndex(0));
            }
        });

        $scope.$on("symbol", (e, groupSymbols) => {
            sessionStorage.groupSymbols = JSON.stringify(groupSymbols);
            const tradeTypes = tradeTypesService.findTickContracts(groupSymbols);
            vm.tradeTypesLength = tradeTypes ? _.keys(tradeTypes).length : 0;
            $scope.$applyAsync(() => {
                vm.options.tradeType =
                    Object.keys(tradeTypes).indexOf(vm.options.tradeType) > -1
                        ? vm.options.tradeType || Object.keys(tradeTypes)[0]
                        : Object.keys(tradeTypes)[0];
                vm.options.tick =
                    vm.options.tick || tradeTypes[vm.options.tradeType][0].min_contract_duration.slice(0, -1);
                vm.options.digit = tradeTypes[vm.options.tradeType][0].last_digit_range
                    ? vm.options.digit || tradeTypes[vm.options.tradeType][0].last_digit_range[0]
                    : null;
                vm.options.barrier =
                    tradeTypes[vm.options.tradeType][0].barriers > 0
                        ? vm.options.barrier || tradeTypes[vm.options.tradeType][0].barrier
                        : null;
                vm.options.selected_tick = vm.options.tradeType === 'High/Low Ticks' ?
                    (vm.options.selected_tick || vm.options.tick) : null;
                const min = parseInt(tradeTypes[vm.options.tradeType][0].min_contract_duration.slice(0, -1));
                const max = parseInt(tradeTypes[vm.options.tradeType][0].max_contract_duration.slice(0, -1));
                vm.tickRangeLength = min && max ? _.range(min, max + 1).length : 0;
                updateProposal();
                tradeService.proposalIsReady = true;
            });
        });

        $scope.$on("authorize", (e, response) => {
            vm.proposal.currency = response.currency;
        });

        $scope.$on("options:updated", (e, options) => {
            vm.options = options;
        });

        $ionicModal
            .fromTemplateUrl("js/pages/trade/components/options/options-modal.html", {
                scope: $scope
            })
            .then(modal => {
                vm.modalCtrl = modal;
            });

        vm.closeModal = function() {
            vm.section1 = vm.SECTIONS.OVERVIEW1;
            vm.section2 = vm.SECTIONS.OVERVIEW2;
            hideModal();
        };

        vm.setSection = function(id, section) {
            switch (section) {
                case vm.SECTIONS.MARKETS: {
                    const markets = JSON.parse(sessionStorage.markets || "{}");
                    if (Object.keys(markets).length <= 1) {
                        return;
                    }
                    break;
                }
                case vm.SECTIONS.UNDERLYINGS: {
                    if (vm.options.market.underlying.length <= 1) {
                        return;
                    }
                    break;
                }
                case vm.SECTIONS.TRADETYPES: {
                    const tradeTypes = JSON.parse(sessionStorage.tradeTypes || "{}");
                    if (Object.keys(tradeTypes).length <= 1) {
                        return;
                    }
                    break;
                }
                case vm.SECTIONS.TICKS: {
                    if (vm.tickRangeLength <= 1) {
                        return;
                    }
                    break;
                }
                default:
                    break;
            }

            if (id === 1) {
                vm.section2 = vm.SECTIONS.OVERVIEW2;
                vm.section1 = section;
            } else if (id === 2) {
                vm.section1 = vm.SECTIONS.OVERVIEW1;
                vm.section2 = section;
            }

            vm.modalCtrl.show();
            appStateService.modalIsOpen = true;
        };

        vm.selectMarket = function(market) {
            if (market) {
                vm.options.market = market;
                vm.options.underlying =
                    !_.isEmpty(vm.options.underlying) &&
                    _.findIndex(market.underlying, ["symbol", vm.options.underlying.symbol]) > -1
                        ? vm.options.underlying
                        : market.underlying[0];
                sessionStorage.removeItem("tradeTypes");
                websocketService.sendRequestFor.contractsForSymbol(vm.options.underlying.symbol);
                vm.section1 = vm.SECTIONS.OVERVIEW1;
                updateProposal();
            }
            hideModal();
        };

        vm.selectUnderlying = function(underlying) {
            vm.options.underlying = underlying;
            vm.options.barrier = null;
            sessionStorage.removeItem("tradeTypes");
            websocketService.sendRequestFor.contractsForSymbol(underlying.symbol);
            vm.section1 = vm.SECTIONS.OVERVIEW1;
            updateProposal();
            hideModal();
        };

        vm.selectTradeType = function(tradeType) {
            vm.options.tradeType = tradeType;
            tradeType = JSON.parse(sessionStorage.tradeTypes)[tradeType][0];
            vm.options.tick = vm.options.tradeType === 'High/Low Ticks' ?
                tradeType.min_contract_duration.slice(0, -1) : vm.options.tick ||
                tradeType.min_contract_duration.slice(0, -1);
            vm.options.digit = tradeType.last_digit_range ? vm.options.digit || tradeType.last_digit_range[0] : null;
            vm.options.barrier =
                tradeType.barriers > 0 && !_.isEmpty(tradeType.barrier)
                    ? vm.options.barrier || tradeType.barrier
                    : null;
            vm.options.selected_tick = vm.options.tradeType === 'High/Low Ticks' ?
                (vm.options.selected_tick || parseInt(vm.options.tick)) : null;
            const min = parseInt(tradeType.min_contract_duration.slice(0, -1));
            const max = parseInt(tradeType.max_contract_duration.slice(0, -1));
            vm.tickRangeLength = min && max ? _.range(min, max + 1).length : 0;
            vm.section2 = vm.SECTIONS.OVERVIEW2;
            updateProposal();
            hideModal();
        };

        vm.selectTick = function(tick) {
            vm.options.tick = tick;
            vm.section2 = vm.SECTIONS.OVERVIEW2;
            updateProposal();
            hideModal();
        };

        vm.selectDigit = function(digit) {
            vm.options.digit = digit;
            vm.options.barrier = null;
            vm.section2 = vm.SECTIONS.OVERVIEW2;
            updateProposal();
            hideModal();
        };

        vm.selectSelectedTick = function(tick) {
            vm.options.selected_tick = tick;
            vm.options.barrier = null;
            vm.section2 = vm.SECTIONS.OVERVIEW2;
            updateProposal();
            hideModal();
        };

        vm.getLanguageId = title =>
            title ? `options.${title.replace(/[\s,/]/g, '_').toLowerCase()}` : title;

        function init() {
            const options = optionsService.get();
            if (!_.isEmpty(options)) {
                vm.options = options;
                // vm.selectMarket(vm.options.market);
                updateProposal();
            }
            websocketService.sendRequestFor.symbols();
        }

        function updateProposal() {
            $scope.$applyAsync(() => {
                vm.proposal = proposalService.update(vm.options);
            });
        }

        function hideModal() {
            if (vm.modalCtrl) {
                vm.modalCtrl.hide();
                appStateService.modalIsOpen = false;
            }
        }

        init();
    }
})();
