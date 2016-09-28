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

    Statement.$inject = ['$scope', '$filter', '$timeout', '$state', 'languageService', 'statementService', 'accountService', 'websocketService', 'appStateService', 'currencyToSymbolService'];

    function Statement($scope, $filter, $timeout, $state, languageService, statementService, accountService, websocketService, appStateService, currencyToSymbolService) {
        var vm = this;
        vm.data = {};
        vm.itemsPerPage = 30;
        vm.itemsFirstCall = vm.itemsPerPage + 1;
        vm.nextPageDisabled = true;
        vm.prevPageDisabled = true;
        vm.transactions = [];
        vm.noTransaction = false;
        vm.data.isStatementSet = false;

        vm.formatMoney = function(currency, amount) {
            vm.currency = sessionStorage.getItem('currency');
            return currencyToSymbolService.formatMoney(currency, amount);
        }

        // refresh table and filters on changing account
        $scope.$on('authorize', () => {
            if (appStateService.statementRefresh && vm.data.isStatementSet) {
                appStateService.statementRefresh = false;
                statementService.remove();
                vm.noTransaction = false;
                vm.transactions = [];
                vm.filteredTransactions = [];
                vm.setParams();
            }
        });

        // function of sending statement table request through websocket
        vm.sendRequest = function() {
            vm.params = {
                "description": 1,
                "limit": vm.itemsFirstCall,
                "offset": vm.data.currentPage * vm.itemsPerPage
            }
            if (vm.data.hasOwnProperty('dateFrom') && vm.data.dateFrom != "") {
                vm.params.date_from = vm.data.dateFrom;
            }
            if (vm.data.hasOwnProperty('dateTo') && vm.data.dateTo != "") {
                vm.params.date_to = vm.data.dateTo;
            }
            websocketService.sendRequestFor.statement(vm.params);
        }

        vm.checkState = function() {
            if (appStateService.isLoggedin) {
                if (!vm.data.isStatementSet) {
                    vm.sendRequest();
                } else if (vm.data.isStatementSet || appStateService.isChangedAccount) {
                    appStateService.isChangedAccount = false;
                    vm.sendRequest();
                }
                statementService.update(vm.data);
            } else {
                $timeout(vm.checkState, 500);
            }
        }

        vm.setParams = function() {
            if (_.isEmpty(sessionStorage.statementState)) {
                vm.data.currentPage = 0;
                vm.data.appID = 'allApps';
                vm.data.dateType = 'allTime';
            } else {
                vm.data = statementService.get();
            }
            return vm.checkState();
        }

        vm.setParams();

        vm.setFilteredTransactions = function() {
            statementService.update(vm.data);
            vm.filteredTransactions = $filter('DataFilter')(vm.transactions, vm.data.appID);
            if (vm.filteredTransactions.length == 0) {
                vm.noTransaction = true;
            } else {
                vm.noTransaction = false;
            }
        }

        // previous button
        vm.prevPage = function() {
            if (vm.data.currentPage > 0) {
                vm.data.currentPage--;
                statementService.update(vm.data);
                vm.sendRequest();
            }
        };
        // next button
        vm.nextPage = function() {
            vm.data.currentPage++;
            statementService.update(vm.data);
            vm.sendRequest();
        };

        // disabling or enabling prev button
        vm.prevButtonState = function() {
                if (vm.data.currentPage == 0) {
                    $scope.$applyAsync(() => {
                        vm.prevPageDisabled = true;
                    });
                } else {
                    $scope.$applyAsync(() => {
                        vm.prevPageDisabled = false;
                    });
                }
            }
            // set currentPage
        vm.setPage = function(n) {
            if (n > 0) {
                vm.data.currentPage = n;
                statementService.update(vm.data);
            }
        };

        vm.setTransactions = function() {
            // check if there are still more to show
            if (vm.count < vm.itemsFirstCall) {
                vm.transactions = vm.items;
                $scope.$applyAsync(() => {
                    vm.nextPageDisabled = true;
                });
            }
            // check if there are no more transaction to show
            else {
                vm.items.forEach(function(el, i) {
                    if (i < vm.count - 1) {
                        vm.transactions.push(vm.items[i]);
                        $scope.$applyAsync(() => {
                            vm.nextPageDisabled = false;
                        });
                    }
                });
            }
        }

        vm.calcTime = function(daysNumber) {
            var now = new Date();
            vm.currentEpoch = now.getTime();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            var midnightEpoch = new Date(today).getTime();
            vm.diff = vm.currentEpoch - midnightEpoch;
            var dayBeforeDate = now.setDate(now.getDate() - daysNumber);
            vm.data.dateFrom = Math.ceil((dayBeforeDate - vm.diff) / 1000);
        }

        vm.dateFilter = function() {
            // preventing from multiple requests at page load
            if (vm.data.isStatementSet) {
                if (vm.data.dateType == 'allTime') {
                    if (vm.data.hasOwnProperty('dateFrom')) {
                        delete vm.data.dateFrom;
                    }
                    if (vm.data.hasOwnProperty('dateTo')) {
                        delete vm.data.dateTo;
                    }
                } else if (vm.data.dateType == 'monthAgo') {
                    vm.calcTime(30);
                    if (vm.data.hasOwnProperty('dateTo')) {
                        delete vm.data.dateTo;
                    }
                } else if (vm.data.dateType == 'sevenDayAgo') {
                    vm.calcTime(7);
                    if (vm.data.hasOwnProperty('dateTo')) {
                        delete vm.data.dateTo;
                    }
                } else if (vm.data.dateType == 'threeDayAgo') {
                    vm.calcTime(3);
                    if (vm.data.hasOwnProperty('dateTo')) {
                        delete vm.data.dateTo;
                    }
                } else if (vm.data.dateType == 'oneDayAgo') {
                    vm.calcTime(1);
                    vm.data.dateTo = Math.ceil((vm.currentEpoch - vm.diff) / 1000);
                } else if (vm.data.dateType == 'today') {
                    vm.calcTime(0);
                    if (vm.data.hasOwnProperty('dateTo')) {
                        delete vm.data.dateTo;
                    }
                }
                vm.filteredTransactions = [];
                vm.data.currentPage = 0;
                statementService.update(vm.data);
                vm.setParams();
            }
        }

        // do this on response of any statement request
        $scope.$on('statement:update', (e, _statement, _passthrough) => {
            vm.data.isStatementSet = true;
            vm.transactions = [];
            vm.statement = _statement;
            vm.count = vm.statement.count;
            if (vm.count > 0) {
                vm.items = vm.statement.transactions;
                // enable and disabling previous button
                vm.prevButtonState();
                vm.setTransactions();
                vm.setFilteredTransactions();
            } else {
                $scope.$applyAsync(() => {
                    vm.prevButtonState();
                    vm.nextPageDisabled = true;
                    vm.noTransaction = true;
                });
            }
        });

        // details functions
        vm.sendContractDetailRequest = function(id) {
            vm.id = id;
            sessionStorage.setItem('id', vm.id);
            $state.go('transactiondetail');
        }
    }
})();
