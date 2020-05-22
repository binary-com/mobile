/**
 * @name profit-table controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.profit-table.controllers").controller("ProfitTableController", ProfitTable);

    ProfitTable.$inject = [
        "$scope",
        "$filter",
        "$timeout",
        "$state",
        "$templateCache",
        "$ionicScrollDelegate",
        "config",
        "tableStateService",
        "websocketService",
        "appStateService"
    ];

    function ProfitTable(
        $scope,
        $filter,
        $timeout,
        $state,
        $templateCache,
        $ionicScrollDelegate,
        config,
        tableStateService,
        websocketService,
        appStateService
    ) {
        const vm = this;
        vm.data = {};
        vm.noTransaction = false;
        vm.noMore = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.goToTopButton = false;
        vm.firstCompleted = false;
        vm.jumpToDateInputShow = false;
        vm.hasError = false;
        vm.dateChanged = false;
        vm.isItemShown = false;
        const appIdAllowed = config.app_id;
        let enteredNow = false;
        let backFromMainPages = false;
        let noMoreRequest = false;
        vm.fractionalDigits = 2;


        const notAuthorizeYet = () => {// check if app is authorized already or has to wait for it to be authorized
            if (appStateService.isLoggedin) {
                vm.currency = sessionStorage.getItem('currency') || 'USD';
                const currencyConfig = appStateService.currenciesConfig || {};
                vm.fractionalDigits = !_.isEmpty(currencyConfig) &&
                currencyConfig[vm.currency] ? currencyConfig[vm.currency].fractional_digits : 2;
                if (appStateService.profitTableRefresh || backFromMainPages) {
                    $templateCache.remove();
                    resetParams();
                    vm.jumpToDateInputShow = false;
                    vm.firstCompleted = false;
                    noMoreRequest = false;
                    vm.hasError = false;
                    vm.filteredTransactions = [];
                    vm.noTransaction = false;
                    backFromMainPages = false;
                    tableStateService.completedGroup = true;
                    appStateService.profitTableRefresh = false;
                    appStateService.isProfitTableSet = false;
                    loadMore();
                }
            }
            // else{
            //    wait for authorize
            // }
        };

        $scope.$on("$stateChangeSuccess", (ev, to, toParams, from, fromParams) => {
            vm.lastPage = from.name;
            enteredNow = true;
            vm.thisPage = to.name;
            // check if state is changed from any state other than transaction-detail
            // we do not refresh the state if it comes back from transaction-detail
            if (vm.lastPage !== "transaction-detail" && vm.thisPage === "profit-table") {
                resetParams();
                vm.firstCompleted = false;
                backFromMainPages = true;
                vm.jumpToDateInputShow = false;
                notAuthorizeYet();
            }
        });

        $scope.$on("authorize", (e, response) => {
            if (appStateService.profitTableRefresh) {
                notAuthorizeYet();
            }
        });

        vm.delayedLoad = () => {
            $timeout(loadMore, 50);
        };

        const loadMore = () => {
            if (!tableStateService.completedGroup) {
                // here can load some amount of transactions already recieved
                setBatch();
            } else if (tableStateService.completedGroup) {
                tableStateService.currentPage += 1;
                pageState();
            }
        };

        const pageState = () => {
            if (!appStateService.isProfitTableSet) {
                appStateService.isProfitTableSet = true;
                tableStateService.dateType = "allTime";
                vm.jumpToDateInputShow = false;
                resetParams();
                setParams();
                tableStateService.completedGroup = false;
                vm.goTop();
            } else if (appStateService.isProfitTableSet && enteredNow && vm.lastPage === "transaction-detail") {
                enteredNow = false;
                vm.lastPage = "";
                setParams();
            } else if (appStateService.isProfitTableSet && vm.dateChanged && tableStateService.completedGroup) {
                vm.transactions = [];
                vm.batchedTransaction = [];
                vm.filteredTransactions = [];
                vm.dateChanged = false;
                tableStateService.currentPage = 0;
                tableStateService.batchNum = 0;
                tableStateService.batchLimit = 0;
                tableStateService.completedGroup = false;
                setParams();
                vm.goTop();
            } else if (appStateService.isProfitTableSet && !vm.dateChanged && tableStateService.completedGroup) {
                vm.transactions = [];
                tableStateService.completedGroup = false;
                setParams();
            } else if (!vm.dateChanged) {
                setParams();
                $scope.$applyAsync(() => {
                    vm.noMore = false;
                });
            }
            sendRequest();
        };

        const setParams = () => {
            vm.data.appID = tableStateService.appID;
            vm.data.dateType = tableStateService.dateType;
            vm.data.dateFrom = tableStateService.dateFrom;
            vm.data.dateTo = tableStateService.dateTo;
            vm.data.currentPage = tableStateService.currentPage;
            vm.itemsPerPage = 300;
            vm.limit = vm.itemsPerPage + 1;
        };

        const resetParams = () => {
            tableStateService.appID = "allApps";
            tableStateService.dateFrom = "";
            tableStateService.dateTo = "";
            tableStateService.currentPage = 0;
            vm.transactions = [];
            vm.batchedTransaction = [];
            tableStateService.completedGroup = true;
            tableStateService.batchNum = 0;
            tableStateService.batchLimit = 0;
        };

        const sendRequest = () => {
            const params = {
                description: 1,
                limit      : vm.limit,
                offset     : vm.itemsPerPage * vm.data.currentPage
            };
            if (vm.data.hasOwnProperty("dateFrom") && vm.data.dateFrom !== "") {
                params.date_from = vm.data.dateFrom;
            }
            if (vm.data.hasOwnProperty("dateTo") && vm.data.dateTo !== "") {
                params.date_to = vm.data.dateTo + 8.64e4;
            }
            params.req_id = vm.data.dateTo || Math.round(new Date().getTime() / 1000);
            vm.reqId = params.req_id;
            websocketService.sendRequestFor.profitTable(params);
        };

        $scope.$on("profit_table:update", (e, _profitTable, _req_id) => {
            vm.firstCompleted = true;
            vm.profitTable = _profitTable;
            const count = vm.profitTable.count;
            vm.hasError = false;
            if (vm.reqId === _req_id) {
                if (count === 0) {
                    vm.noTransaction = true;
                    $scope.$applyAsync(() => {
                        vm.noMore = true;
                    });
                    setBatch();
                } else if (count > 0) {
                    if (count < vm.limit) {
                        // has no more to load on next call
                        vm.noTransaction = false;
                        // $scope.$applyAsync(() => {
                        noMoreRequest = true;
                        // });
                        vm.profitTable.transactions.forEach((el, i) => {
                            vm.transactions.push(vm.profitTable.transactions[i]);
                        });
                        setBatch();
                    } else if (count === vm.limit) {
                        // has at least one transaction on next call to show to user
                        vm.noTransaction = false;
                        $scope.$applyAsync(() => {
                            vm.noMore = false;
                        });
                        vm.profitTable.transactions.forEach((el, i) => {
                            if (i < count - 1) {
                                vm.transactions.push(vm.profitTable.transactions[i]);
                            }
                        });
                        setBatch();
                    }
                }
            }
        });

        $scope.$on("profit_table:error", (e, message) => {
            $scope.$applyAsync(() => {
                vm.hasError = true;
                vm.errorMessage = message;
            });
        });

        const setBatch = () => {
            tableStateService.batchLimit = Math.ceil(vm.transactions.length / tableStateService.batchSize);
            let sliced = [];
            sliced = vm.transactions.slice(
                tableStateService.batchNum * tableStateService.batchSize,
                (tableStateService.batchNum + 1) * tableStateService.batchSize
            );
            sliced.forEach((el, i) => {
                vm.batchedTransaction.push(sliced[i]);
            });
            tableStateService.batchNum += 1;
            if (tableStateService.batchNum === tableStateService.batchLimit) {
                tableStateService.batchLimit = 0;
                tableStateService.batchNum = 0;
                tableStateService.completedGroup = true;
                if (noMoreRequest) {
                    $scope.$applyAsync(() => {
                        vm.noMore = true;
                    });
                }
            }

            vm.setFiltered();
        };

        vm.setFiltered = () => {
            $scope.$applyAsync(() => {
                tableStateService.appID = vm.data.appID;
                vm.filteredTransactions = $filter("DataFilter")(
                    vm.batchedTransaction,
                    tableStateService.appID,
                    appIdAllowed
                );
                if (vm.filteredTransactions.length === 0) {
                    vm.noTransaction = true;
                } else {
                    vm.noTransaction = false;
                }
                $scope.$broadcast("scroll.infiniteScrollComplete");
            });
        };

        vm.dateFilter = () => {
            tableStateService.dateType = vm.data.dateType;
            vm.dateChanged = true;
            vm.noTransaction = false;
            if (tableStateService.dateType === "allTime") {
                $scope.$applyAsync(() => {
                    vm.jumpToDateInputShow = false;
                });
                tableStateService.completedGroup = true;
                vm.firstCompleted = false;
                vm.data.dateTo = "";
                tableStateService.dateFrom = "";
                tableStateService.dateTo = "";
                loadMore();
            } else if (tableStateService.dateType === "jumpToDate") {
                $scope.$applyAsync(() => {
                    vm.jumpToDateInputShow = true;
                });
                tableStateService.completedGroup = true;
                vm.firstCompleted = false;
                vm.nowDateInputLimit = $filter("date")(new Date(), "yyyy-MM-dd");
                document.getElementById("dateTo").setAttribute("max", vm.nowDateInputLimit);
                document.getElementById("dateTo").value = vm.nowDateInputLimit;
                vm.jumpToDateFilter();
            }
        };

        vm.jumpToDateFilter = () => {
            if (tableStateService.dateType === "jumpToDate") {
                tableStateService.completedGroup = true;
                vm.dateChanged = true;
                vm.noTransaction = false;
                vm.firstCompleted = false;
                tableStateService.currentPage = 0;
                vm.data.dateTo = new Date(vm.data.end).getTime() / 1000 || "";
                tableStateService.dateTo = vm.data.dateTo;
                loadMore();
            }
        };

        vm.toggleItem = () => {
            vm.isItemShown = !vm.isItemShown;
            const content = document.getElementsByClassName("profit-table-expandable")[0];
            content.id = content.id === "profit-table-filter-active" ? "" : "profit-table-filter-active";
        };

        vm.goTop = () => {
            $ionicScrollDelegate.scrollTop(true);
        };

        vm.goToTopButtonCondition = () => {
            $timeout(() => {
                const position = $ionicScrollDelegate.$getByHandle("handler").getScrollPosition();
                vm.goToTopButton = position ? position.top >= 30 : false;
            }, 500);
        };

        // details functions
        vm.sendContractDetailRequest = id => {
            if (id) {
                sessionStorage.setItem("id", id);
                $state.go("transaction-detail");
            }
        };
    }
})();
