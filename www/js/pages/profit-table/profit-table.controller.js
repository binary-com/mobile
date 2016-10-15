/**
 * @name profit-table controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.profit-table.controllers')
        .controller('ProfitTableController', ProfitTable);

    ProfitTable.$inject = ['$scope', '$filter', '$state', '$timeout', '$templateCache', '$ionicScrollDelegate', 'languageService', 'tableStateService', 'accountService', 'websocketService', 'appStateService', 'currencyToSymbolService'];

    function ProfitTable($scope, $filter, $state, $timeout, $templateCache, $ionicScrollDelegate, languageService, tableStateService, accountService, websocketService, appStateService, currencyToSymbolService) {
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

        $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
            vm.lastPage = from.name;
            vm.enteredNow = true;
            vm.thisPage = to.name;
            // check if state is changed from any state other than transactiondetail
            // we do not refresh the state if it comes back from transactiondetail
            if (vm.lastPage != 'transactiondetail' && vm.thisPage == 'profittable') {
                vm.resetParams();
                vm.firstCompleted = false;
                vm.backFromMainPages = true;
                vm.jumpToDateInputShow = false;
                vm.notAuthorizeYet();
            }
        });

        $scope.$on('authorize', (e, response) => {
            if (appStateService.profitTableRefresh) {
                vm.notAuthorizeYet();
            }
        });

        vm.notAuthorizeYet = function() {
            // check if app is authorized already or has to wait for it to be authorized
            if (appStateService.isLoggedin) {
                if (appStateService.profitTableRefresh || vm.backFromMainPages) {
                    $templateCache.remove();
                    vm.resetParams();
                    vm.jumpToDateInputShow = false;
                    vm.firstCompleted = false;
                    vm.noMoreRequest = false;
                    vm.filteredTransactions = [];
                    vm.noTransaction = false;
                    vm.backFromMainPages = false;
                    tableStateService.completedGroup = true;
                    appStateService.profitTableRefresh = false;
                    appStateService.isProfitTableSet = false;
                    vm.loadMore();
                }
            }
            // else{
            //    wait for authorize
            // }
        }

        vm.loadMore = function() {
            if (!tableStateService.completedGroup) {
                // here can load some amount of transactions already recieved
                vm.setBatch();
            } else if (tableStateService.completedGroup) {
                tableStateService.currentPage += 1;
                vm.pageState();
            }
        }

        $scope.$on('scroll.infiniteScrollComplete', () => {
            // console.log('new data loaded');
        });

        vm.pageState = function() {
            if (!appStateService.isProfitTableSet) {
                appStateService.isProfitTableSet = true;
                tableStateService.dateType = 'allTime';
                vm.jumpToDateInputShow = false;
                vm.resetParams();
                vm.setParams();
                tableStateService.completedGroup = false;
            } else if (appStateService.isProfitTableSet && vm.enteredNow && vm.lastPage == 'transactiondetail') {
                vm.enteredNow = false;
                vm.lastPage = '';
                vm.setParams();
            } else if (appStateService.isProfitTableSet && appStateService.isChangedAccount) {
                // if account is changed reset data attributes and send request again
                tableStateService.dateType = 'allTime';
                vm.jumpToDateInputShow = false;
                vm.resetParams();
                vm.setParams();
                vm.goTop();
            } else if (appStateService.isProfitTableSet && vm.dateChanged == true) {
                vm.transactions = [];
                vm.batchedTransaction = [];
                vm.filteredTransactions = [];
                vm.dateChanged = false;
                tableStateService.currentPage = 0;
                tableStateService.completedGroup = true;
                tableStateService.batchNum = 0;
                tableStateService.batchLimit = 0;
                vm.setParams();
                vm.goTop();
            } else if (appStateService.isProfitTableSet && tableStateService.completedGroup) {
                vm.transactions = [];
                tableStateService.completedGroup = false;
            } else {
                vm.setParams();
                $scope.$applyAsync(() => {
                    vm.noMore = false;
                });

            }
            vm.sendRequest();
        }

        vm.setParams = function() {
            vm.data.appID = tableStateService.appID;
            vm.data.dateType = tableStateService.dateType;
            vm.data.dateFrom = tableStateService.dateFrom;
            vm.data.dateTo = tableStateService.dateTo;
            vm.data.currentPage = tableStateService.currentPage;
            vm.itemsPerPage = 300;
            vm.limit = vm.itemsPerPage + 1;
        }
        vm.resetParams = function() {
            tableStateService.appID = 'allApps';
            tableStateService.dateFrom = '';
            tableStateService.dateTo = '';
            tableStateService.currentPage = 0;
            vm.transactions = [];
            vm.batchedTransaction = [];
            tableStateService.completedGroup = true;
            tableStateService.batchNum = 0;
            tableStateService.batchLimit = 0;
        }

        vm.sendRequest = function() {
            vm.params = {
                "description": 1,
                "limit": vm.limit,
                "offset": vm.itemsPerPage * vm.data.currentPage
            }
            if (vm.data.hasOwnProperty('dateFrom') && vm.data.dateFrom != "") {
                vm.params.date_from = vm.data.dateFrom;

            }
            if (vm.data.hasOwnProperty('dateTo') && vm.data.dateTo != "") {
                vm.params.date_to = vm.data.dateTo;
            }
            websocketService.sendRequestFor.profitTable(vm.params);
        }

        $scope.$on('profit_table:update', (e, _profitTable, _passthrough) => {
            vm.profitTable = _profitTable;
            vm.count = vm.profitTable.count;
            vm.firstCompleted = true;
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
                    vm.profitTable.transactions.forEach(function(el, i) {
                        vm.transactions.push(vm.profitTable.transactions[i]);
                    });
                    vm.setBatch();
                } else if (vm.count == vm.limit) {
                    // has at least one transaction on next call to show to user
                    vm.noTransaction = false;
                    $scope.$applyAsync(() => {
                        vm.noMore = false;
                    });
                    vm.profitTable.transactions.forEach(function(el, i) {
                        if (i < vm.count - 1) {
                            vm.transactions.push(vm.profitTable.transactions[i]);
                        }
                    });
                    vm.setBatch();
                }
            }
        });

        vm.setBatch = function() {
            tableStateService.batchLimit = Math.ceil(vm.transactions.length / tableStateService.batchSize);
            vm.sliced = [];
            vm.sliced = vm.transactions.slice(tableStateService.batchNum * tableStateService.batchSize, (tableStateService.batchNum + 1) * tableStateService.batchSize);
            vm.sliced.forEach(function(el, i) {
                vm.batchedTransaction.push(vm.sliced[i]);
            });
            tableStateService.batchNum = tableStateService.batchNum + 1;
            if (tableStateService.batchNum == tableStateService.batchLimit) {
                tableStateService.batchLimit = 0;
                tableStateService.batchNum = 0;
                tableStateService.completedGroup = true;
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
                vm.filteredTransactions = $filter('DataFilter')(vm.batchedTransaction, vm.data.appID);
                if (vm.filteredTransactions.length == 0) {
                    vm.noTransaction = true;
                } else {
                    vm.noTransaction = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        vm.dateFilter = function() {
            if (vm.data.dateType == 'allTime') {
                tableStateService.dateType = 'allTime';
                tableStateService.dateFrom = '';
                tableStateService.dateTo = '';
                vm.jumpToDateInputShow = false;
            }
            if (vm.data.dateType == 'jumpToDate'){
              vm.jumpToDateInputShow = true;
              vm.nowDateInputLimit = $filter('date')(new Date(), 'yyyy-MM-dd');
              document.getElementById('dateTo').setAttribute('max', vm.nowDateInputLimit);
            }
            tableStateService.dateType = vm.data.dateType;
            vm.dateChanged = true;
            vm.pageState();
        }

        vm.jumpToDateFilter = function(){
          vm.data.dateTo = (new Date(vm.data.end).getTime()) / 1000 || "";
          tableStateService.dateTo = vm.data.dateTo;
          vm.dateChanged = true;
          vm.pageState();
        }

        vm.formatMoney = function(currency, amount) {
            vm.currency = sessionStorage.getItem('currency');
            return currencyToSymbolService.formatMoney(currency, amount);
        }

        vm.goTop = function() {
            $ionicScrollDelegate.scrollTop(true);
            vm.goToTopButton = false;
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
            vm.id = id;
            sessionStorage.setItem('id', vm.id);
            $state.go('transactiondetail');
        }
    }
})();
