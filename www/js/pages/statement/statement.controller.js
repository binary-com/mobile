/**
 * @name statement controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.statement.controllers')
        .controller('StatementController', Statement);

    Statement.$inject = ['$scope', '$filter', '$timeout', '$state', '$templateCache',
        '$ionicScrollDelegate', 'config', 'tableStateService',
        'websocketService', 'appStateService'
    ];

    function Statement($scope, $filter, $timeout, $state, $templateCache,
        $ionicScrollDelegate, config, tableStateService,
        websocketService, appStateService) {
        var vm = this;
        vm.data = {};
        vm.noTransaction = false;
        vm.noMore = false;
        vm.hasRefresh = false;
        vm.enteredNow = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.goToTopButton = false;
        vm.backFromMainPages = false;
        vm.firstCompleted = false;
        vm.noMoreRequest = false;
        vm.jumpToDateInputShow = false;
        vm.hasError = false;
        vm.dateChanged = false;
        vm.appIdAllowed = config.app_id;

        $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            vm.lastPage = from.name;
            vm.enteredNow = true;
            vm.thisPage = to.name;
            // check if state is changed from any state other than transactiondetail
            // we do not refresh the state if it comes back from transactiondetail
            if (vm.lastPage != 'transactiondetail' && vm.thisPage == 'statement') {
                vm.resetParams();
                vm.firstCompleted = false;
                vm.backFromMainPages = true;
                vm.jumpToDateInputShow = false;
                vm.notAuthorizeYet();
            }
        });

        $scope.$on('authorize', (e, response) => {
            if (appStateService.statementRefresh) {
                vm.notAuthorizeYet();
            }
        });

        vm.notAuthorizeYet = function() {
            // check if app is authorized already or has to wait for it to be authorized
            if (appStateService.isLoggedin) {
                if (appStateService.statementRefresh || vm.backFromMainPages) {
                    $templateCache.remove();
                    vm.resetParams();
                    vm.jumpToDateInputShow = false;
                    vm.firstCompleted = false;
                    vm.noMoreRequest = false;
                    vm.hasError = false;
                    vm.filteredTransactions = [];
                    vm.noTransaction = false;
                    vm.backFromMainPages = false;
                    tableStateService.statementCompletedGroup = true;
                    appStateService.statementRefresh = false;
                    appStateService.isStatementSet = false;
                    vm.hasError = false;
                    vm.loadMore();
                }
            }
            // else{
            //    wait for authorize
            // }
        }

        vm.delayedLoad = function() {
            $timeout(vm.loadMore, 50);
        }

        vm.loadMore = function() {
            if (!tableStateService.statementCompletedGroup) {
                // here can load some amount of transactions already recieved
                vm.setBatch();
            } else if (tableStateService.statementCompletedGroup) {
                tableStateService.statementCurrentPage += 1;
                vm.pageState();
            }
        }

        vm.pageState = function() {
            if (!appStateService.isStatementSet) {
                appStateService.isStatementSet = true;
                tableStateService.statementDateType = 'allTime';
                vm.jumpToDateInputShow = false;
                vm.resetParams();
                vm.setParams();
                tableStateService.statementCompletedGroup = false;
                vm.goTop();
            } else if (!appStateService.isStatementSet && vm.enteredNow && vm.lastPage == 'transactiondetail') {
                vm.enteredNow = false;
                vm.lastPage = '';
                vm.setParams();
            } else if (appStateService.isStatementSet && vm.dateChanged && tableStateService.statementCompletedGroup) {
                vm.transactions = [];
                vm.batchedTransaction = [];
                vm.filteredTransactions = [];
                vm.dateChanged = false;
                tableStateService.statementCurrentPage = 0;
                tableStateService.statementBatchNum = 0;
                tableStateService.statementBatchLimit = 0;
                tableStateService.statementCompletedGroup = false;
                vm.setParams();
                vm.goTop();
            } else if (appStateService.isStatementSet && !vm.dateChanged && tableStateService.statementCompletedGroup) {
                vm.transactions = [];
                tableStateService.statementCompletedGroup = false;
                vm.setParams();
            } else {
                if (!vm.dateChanged) {
                    vm.setParams();
                    $scope.$applyAsync(() => {
                        vm.noMore = false;
                    });
                }

            }
            vm.sendRequest();
        }

        vm.setParams = function() {
            vm.data.appID = tableStateService.statementAppID;
            vm.data.dateType = tableStateService.statementDateType;
            vm.data.dateFrom = tableStateService.statementDateFrom;
            vm.data.dateTo = tableStateService.statementDateTo;
            vm.data.statementCurrentPage = tableStateService.statementCurrentPage;
            vm.itemsPerPage = 300;
            vm.limit = vm.itemsPerPage + 1;
        }
        vm.resetParams = function() {
            tableStateService.statementAppID = 'allApps';
            tableStateService.statementDateFrom = '';
            tableStateService.statementDateTo = '';
            tableStateService.statementCurrentPage = 0;
            vm.transactions = [];
            vm.batchedTransaction = [];
            tableStateService.statementCompletedGroup = true;
            tableStateService.statementBatchNum = 0;
            tableStateService.statementBatchLimit = 0;
        }

        vm.sendRequest = function() {
            vm.params = {
                "description": 1,
                "limit": vm.limit,
                "offset": vm.itemsPerPage * vm.data.statementCurrentPage
            }
            if (vm.data.hasOwnProperty('dateFrom') && vm.data.dateFrom != "") {
                vm.params.date_from = vm.data.dateFrom;
            }
            if (vm.data.hasOwnProperty('dateTo') && vm.data.dateTo != "") {
                vm.params.date_to = vm.data.dateTo + 8.64e+4;
            }
            vm.params.req_id = vm.data.dateTo || (Math.round(new Date().getTime() / 1000)) ;
            vm.reqId = vm.params.req_id;
            websocketService.sendRequestFor.statement(vm.params);
        }

        $scope.$on('statement:update', (e, _statement, _req_id) => {
            vm.firstCompleted = true;
            vm.statement = _statement;
            vm.count = vm.statement.count;
            vm.hasError = false;
            if(vm.reqId == _req_id){
            if (vm.count == 0) {
                vm.noTransaction = true;
                $scope.$applyAsync(() => {
                    vm.noMore = true;
                });
                vm.setBatch();
            } else if (vm.count > 0) {
                if (vm.count < vm.limit) {
                    // has no more to load on next call
                    vm.noTransaction = false;
                    // $scope.$applyAsync(() => {
                    vm.noMoreRequest = true;
                    // });
                    vm.statement.transactions.forEach(function(el, i) {
                        vm.transactions.push(vm.statement.transactions[i]);
                    });
                    vm.setBatch();
                } else if (vm.count == vm.limit) {
                    // has at least one transaction on next call to show to user
                    vm.noTransaction = false;
                    $scope.$applyAsync(() => {
                        vm.noMore = false;
                    });
                    vm.statement.transactions.forEach(function(el, i) {
                        if (i < vm.count - 1) {
                            vm.transactions.push(vm.statement.transactions[i]);
                        }
                    });
                    vm.setBatch();
                }
            }
          }
        });

        $scope.$on('statement:error', (e, message) => {
            $scope.$applyAsync(() => {
                vm.hasError = true;
                vm.errorMessage = message;
            });
        });

        vm.setBatch = function() {
            tableStateService.statementBatchLimit = Math.ceil(vm.transactions.length / tableStateService.statementBatchSize);
            vm.sliced = [];
            vm.sliced = vm.transactions.slice(tableStateService.statementBatchNum * tableStateService.statementBatchSize, (tableStateService.statementBatchNum + 1) * tableStateService.statementBatchSize);
            vm.sliced.forEach(function(el, i) {
                vm.batchedTransaction.push(vm.sliced[i]);
            });
            tableStateService.statementBatchNum = tableStateService.statementBatchNum + 1;
            if (tableStateService.statementBatchNum == tableStateService.statementBatchLimit) {
                tableStateService.statementBatchLimit = 0;
                tableStateService.statementBatchNum = 0;
                tableStateService.statementCompletedGroup = true;
                if (vm.noMoreRequest) {
                    $scope.$applyAsync(() => {
                        vm.noMore = true;
                    });
                }
            }

            vm.setFiltered();
        }

        vm.setFiltered = function() {
            $scope.$applyAsync(() => {
                tableStateService.statementAppID = vm.data.appID;
                vm.filteredTransactions = $filter('StatementDataFilter')(vm.batchedTransaction, tableStateService.statementAppID, vm.appIdAllowed);
                if (vm.filteredTransactions.length == 0) {
                    vm.noTransaction = true;
                } else {
                    vm.noTransaction = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        vm.dateFilter = function() {
            vm.noTransaction = false;
            vm.dateChanged = true;
            tableStateService.statementDateType = vm.data.dateType;
            if (vm.data.dateType == 'allTime') {
                $scope.$applyAsync(() => {
                    vm.jumpToDateInputShow = false;
                });
                tableStateService.statementCompletedGroup = true;
                vm.firstCompleted = false;
                vm.data.dateTo = '';
                tableStateService.statementDateFrom = '';
                tableStateService.statementDateTo = '';
                vm.loadMore();
            }
            if (vm.data.dateType == 'jumpToDate') {
                $scope.$applyAsync(() => {
                    vm.jumpToDateInputShow = true;
                });
                tableStateService.statementCompletedGroup = true;
                vm.firstCompleted = false;
                vm.nowDateInputLimit = $filter('date')(new Date(), 'yyyy-MM-dd');
                document.getElementById('statement-dateTo').setAttribute('max', vm.nowDateInputLimit);
                document.getElementById('statement-dateTo').value = vm.nowDateInputLimit;
                vm.jumpToDateFilter();
            }
        }

        vm.jumpToDateFilter = function() {
            if (tableStateService.statementDateType == 'jumpToDate') {
              tableStateService.statementCompletedGroup = true;
                vm.dateChanged = true;
                vm.noTransaction = false;
                vm.firstCompleted = false;
                tableStateService.statementCurrentPage = 0;
                vm.data.dateTo = (new Date(vm.data.end).getTime()) / 1000 || "";
                tableStateService.statementDateTo = vm.data.dateTo;
                vm.loadMore();
            }
        }

        vm.goTop = function() {
            $ionicScrollDelegate.scrollTop(true);
        }

        vm.goToTopButtonCondition = function() {
            $scope.$applyAsync(() => {
                if ($ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top >= 30) {
                    vm.goToTopButton = true;
                } else if ($ionicScrollDelegate.$getByHandle('handler').getScrollPosition().top < 30) {
                    vm.goToTopButton = false;
                }
            });
        }

        // details functions
        vm.sendContractDetailRequest = function(id) {
          if(id){
            vm.id = id;
            sessionStorage.setItem('id', vm.id);
            $state.go('transactiondetail');
          }
        }

    }
})();
