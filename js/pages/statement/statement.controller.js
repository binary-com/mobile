/**
 * @name statement controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.statement.controllers").controller("StatementController", Statement);

    Statement.$inject = [
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

    function Statement(
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
                if (appStateService.statementRefresh || backFromMainPages) {
                    $templateCache.remove();
                    resetParams();
                    vm.jumpToDateInputShow = false;
                    vm.firstCompleted = false;
                    noMoreRequest = false;
                    vm.hasError = false;
                    vm.filteredTransactions = [];
                    vm.noTransaction = false;
                    backFromMainPages = false;
                    tableStateService.statementCompletedGroup = true;
                    appStateService.statementRefresh = false;
                    appStateService.isStatementSet = false;
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
            if (vm.lastPage !== "transaction-detail" && vm.thisPage === "statement") {
                resetParams();
                vm.firstCompleted = false;
                backFromMainPages = true;
                vm.jumpToDateInputShow = false;
                notAuthorizeYet();
            }
        });

        $scope.$on("authorize", (e, response) => {
            if (appStateService.statementRefresh) {
                notAuthorizeYet();
            }
        });

        vm.delayedLoad = () => {
            $timeout(loadMore, 50);
        };

        const loadMore = () => {
            if (!tableStateService.statementCompletedGroup) {
                // here can load some amount of transactions already recieved
                setBatch();
            } else if (tableStateService.statementCompletedGroup) {
                tableStateService.statementCurrentPage += 1;
                pageState();
            }
        };

        const pageState = () => {
            if (!appStateService.isStatementSet) {
                appStateService.isStatementSet = true;
                tableStateService.statementDateType = "allTime";
                vm.jumpToDateInputShow = false;
                resetParams();
                setParams();
                tableStateService.statementCompletedGroup = false;
                vm.goTop();
            } else if (!appStateService.isStatementSet && enteredNow && vm.lastPage === "transaction-detail") {
                enteredNow = false;
                vm.lastPage = "";
                setParams();
            } else if (appStateService.isStatementSet && vm.dateChanged && tableStateService.statementCompletedGroup) {
                vm.transactions = [];
                vm.batchedTransaction = [];
                vm.filteredTransactions = [];
                vm.dateChanged = false;
                tableStateService.statementCurrentPage = 0;
                tableStateService.statementBatchNum = 0;
                tableStateService.statementBatchLimit = 0;
                tableStateService.statementCompletedGroup = false;
                setParams();
                vm.goTop();
            } else if (appStateService.isStatementSet && !vm.dateChanged && tableStateService.statementCompletedGroup) {
                vm.transactions = [];
                tableStateService.statementCompletedGroup = false;
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
            vm.data.appID = tableStateService.statementAppID;
            vm.data.dateType = tableStateService.statementDateType;
            vm.data.dateFrom = tableStateService.statementDateFrom;
            vm.data.dateTo = tableStateService.statementDateTo;
            vm.data.statementCurrentPage = tableStateService.statementCurrentPage;
            vm.itemsPerPage = 300;
            vm.limit = vm.itemsPerPage + 1;
        };

        const resetParams = () => {
            tableStateService.statementAppID = "allApps";
            tableStateService.statementDateFrom = "";
            tableStateService.statementDateTo = "";
            tableStateService.statementCurrentPage = 0;
            vm.transactions = [];
            vm.batchedTransaction = [];
            tableStateService.statementCompletedGroup = true;
            tableStateService.statementBatchNum = 0;
            tableStateService.statementBatchLimit = 0;
        };

        const sendRequest = () => {
            const params = {
                description: 1,
                limit      : vm.limit,
                offset     : vm.itemsPerPage * vm.data.statementCurrentPage
            };
            if (vm.data.hasOwnProperty("dateFrom") && vm.data.dateFrom !== "") {
                params.date_from = vm.data.dateFrom;
            }
            if (vm.data.hasOwnProperty("dateTo") && vm.data.dateTo !== "") {
                params.date_to = vm.data.dateTo + 8.64e4;
            }
            params.req_id = vm.data.dateTo || Math.round(new Date().getTime() / 1000);
            vm.reqId = params.req_id;
            websocketService.sendRequestFor.statement(params);
        };

        $scope.$on("statement:update", (e, _statement, _req_id) => {
            vm.firstCompleted = true;
            vm.statement = _statement;
            const count = vm.statement.count;
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
                        vm.statement.transactions.forEach((el, i) => {
                            vm.transactions.push(vm.statement.transactions[i]);
                        });
                        setBatch();
                    } else if (count === vm.limit) {
                        // has at least one transaction on next call to show to user
                        vm.noTransaction = false;
                        $scope.$applyAsync(() => {
                            vm.noMore = false;
                        });
                        vm.statement.transactions.forEach((el, i) => {
                            if (i < count - 1) {
                                vm.transactions.push(vm.statement.transactions[i]);
                            }
                        });
                        setBatch();
                    }
                }
            }
        });

        $scope.$on("statement:error", (e, message) => {
            $scope.$applyAsync(() => {
                vm.hasError = true;
                vm.errorMessage = message;
            });
        });

        const setBatch = () => {
            tableStateService.statementBatchLimit =
              Math.ceil(vm.transactions.length / tableStateService.statementBatchSize);
            let sliced = [];
            sliced = vm.transactions.slice(
                tableStateService.statementBatchNum * tableStateService.statementBatchSize,
                (tableStateService.statementBatchNum + 1) * tableStateService.statementBatchSize
            );
            sliced.forEach((el, i) => {
                vm.batchedTransaction.push(sliced[i]);
            });
            tableStateService.statementBatchNum += 1;
            if (tableStateService.statementBatchNum === tableStateService.statementBatchLimit) {
                tableStateService.statementBatchLimit = 0;
                tableStateService.statementBatchNum = 0;
                tableStateService.statementCompletedGroup = true;
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
                tableStateService.statementAppID = vm.data.appID;
                vm.filteredTransactions = $filter("StatementDataFilter")(
                    vm.batchedTransaction,
                    tableStateService.statementAppID,
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
            tableStateService.statementDateType = vm.data.dateType;
            vm.dateChanged = true;
            vm.noTransaction = false;
            if (vm.data.dateType === "allTime") {
                $scope.$applyAsync(() => {
                    vm.jumpToDateInputShow = false;
                });
                tableStateService.statementCompletedGroup = true;
                vm.firstCompleted = false;
                vm.data.dateTo = "";
                tableStateService.statementDateFrom = "";
                tableStateService.statementDateTo = "";
                loadMore();
            }
            if (vm.data.dateType === "jumpToDate") {
                $scope.$applyAsync(() => {
                    vm.jumpToDateInputShow = true;
                });
                tableStateService.statementCompletedGroup = true;
                vm.firstCompleted = false;
                vm.nowDateInputLimit = $filter("date")(new Date(), "yyyy-MM-dd");
                document.getElementById("statement-dateTo").setAttribute("max", vm.nowDateInputLimit);
                document.getElementById("statement-dateTo").value = vm.nowDateInputLimit;
                vm.jumpToDateFilter();
            }
        };

        vm.jumpToDateFilter = () => {
            if (tableStateService.statementDateType === "jumpToDate") {
                tableStateService.statementCompletedGroup = true;
                vm.dateChanged = true;
                vm.noTransaction = false;
                vm.firstCompleted = false;
                tableStateService.statementCurrentPage = 0;
                vm.data.dateTo = new Date(vm.data.end).getTime() / 1000 || "";
                tableStateService.statementDateTo = vm.data.dateTo;
                loadMore();
            }
        };

        vm.toggleItem = () => {
            vm.isItemShown = !vm.isItemShown;
            const content = document.getElementsByClassName("statement-content-expandable")[0];
            content.id = content.id === "statement-filter-active" ? "" : "statement-filter-active";
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
