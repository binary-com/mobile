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

    Statement.$inject = ['$scope', '$filter', '$timeout', '$state', 'languageService', 'statementService', 'accountService', 'websocketService', 'appStateService'];

    function Statement($scope, $filter, $timeout, $state, languageService, statementService, accountService, websocketService, appStateService) {
        var vm = this;
        vm.data = {};
        vm.itemsPerPage = 10;
        vm.itemsFirstCall = vm.itemsPerPage + 1;
        vm.nextPageDisabled = true;
        vm.prevPageDisabled = true;
        vm.customDateEnabled = false;
        vm.transactions = [];
        vm.noTransaction = false;
        vm.data = {};
        vm.data.isStatementSet = false;


        // refresh table and filters on changing account
        $scope.$on('changedAccount', () => {
            if (appStateService.isChangedAccount) {
                appStateService.isChangedAccount = false;
                statementService.remove();
                if (vm.data.isStatementSet) {
                    vm.setDefaultParams();
                }
            }
        });

        // function of sending profti table request through websocket
        vm.setStatementParams = function() {

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
            // check if user is loggedin for preventing errors on page refresh
            // send request for profit table for the first time
        vm.sendStatementRequest = function() {
            if (appStateService.isLoggedin) {
                if (!vm.data.isStatementSet) {
                    vm.setStatementParams();
                    statementService.update(vm.data);
                } else if (vm.data.isStatementSet || appStateService.isChangedAccount) {
                    appStateService.isChangedAccount = false;
                    vm.setStatementParams();
                    statementService.update(vm.data);
                }
            } else {
                $timeout(vm.sendStatementRequest, 500);
            }
        }

        vm.setDefaultParams = function() {
            if (_.isEmpty(localStorage.statementState)) {
                vm.data.currentPage = 0;
                vm.data.appID = 'allApps';
                vm.data.dateType = 'allTime';
            } else {
                vm.data = statementService.get();
                if (vm.data.dateType == 'customDate') {
                    $scope.$applyAsync(() => {
                        document.getElementById("start").value = $filter('date')(new Date(vm.data.dateFrom * 1000).toISOString().slice(0, 10), 'yyyy-MM-dd');
                        document.getElementById("end").value = $filter('date')(new Date(vm.data.dateTo * 1000).toISOString().slice(0, 10), 'yyyy-MM-dd');
                        vm.customDateEnabled = true;
                    });
                    statementService.update(vm.data);
                }
            }
            return vm.sendStatementRequest();
        }

        vm.setDefaultParams();
        // previous button
        vm.prevPage = function() {
            if (vm.data.currentPage > 0) {
                vm.data.currentPage--;
            }
        };
        // next button
        vm.nextPage = function() {
            vm.data.currentPage++;
        };

        // disabling or enabling prev button
        vm.prevButtonState = function() {
                if (vm.data.currentPage == 0) {
                    $scope.$applyAsync(() => {
                        vm.prevPageDisabled = true;
                    });
                } else if (vm.data.currentPage != 0) {
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

        vm.setTiming = function(daysNumber) {
            var now = new Date();
            vm.currentEpoch = now.getTime();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
            var midnightEpoch = new Date(today).getTime();
            vm.diff = vm.currentEpoch - midnightEpoch;
            var dayBeforeDate = now.setDate(now.getDate() - daysNumber);
            vm.data.dateFrom = Math.ceil((dayBeforeDate - vm.diff) / 1000);
        }

        // watch currentPage for changing the pages via next or prev button
        // whenever changed send request for new data
        $scope.$watch("vm.data.currentPage", (newValue, oldValue) => {
            vm.data.currentPage = newValue;
            if (vm.data.isStatementSet) {
                vm.setStatementParams();
                statementService.update(vm.data);
            }
        });
        $scope.$watch("vm.data.appID", () => {
            statementService.update(vm.data);
        });

        $scope.$watch("vm.data.dateType", () => {
            vm.data.currentPage = 0;
            vm.transactions = [];

            // preventing from multiple requests at page load
            if (vm.data.isStatementSet) {

                if (vm.data.dateType == 'customDate') {
                    vm.customDateEnabled = true;
                    if (vm.data.isStatementSet) {
                        vm.setCustomDate();
                    }
                } else {
                    vm.customDateEnabled = false;

                    if (vm.data.dateType == 'allTime') {
                        if (vm.data.hasOwnProperty('dateFrom')) {
                            delete vm.data.dateFrom;
                        }
                        if (vm.data.hasOwnProperty('dateTo')) {
                            delete vm.data.dateTo;
                        }
                    } else if (vm.data.dateType == 'monthAgo') {
                        vm.setTiming(30);
                        if (vm.data.hasOwnProperty('dateTo')) {
                            delete vm.data.dateTo;
                        }
                    } else if (vm.data.dateType == 'sevenDayAgo') {
                        vm.setTiming(7);
                        if (vm.data.hasOwnProperty('dateTo')) {
                            delete vm.data.dateTo;
                        }
                    } else if (vm.data.dateType == 'threeDayAgo') {
                        vm.setTiming(3);
                        if (vm.data.hasOwnProperty('dateTo')) {
                            delete vm.data.dateTo;
                        }
                    } else if (vm.data.dateType == 'oneDayAgo') {
                        vm.setTiming(1);
                        vm.data.dateTo = Math.ceil((vm.currentEpoch - vm.diff) / 1000);
                    } else if (vm.data.dateType == 'today') {
                        vm.setTiming(0);
                        if (vm.data.hasOwnProperty('dateTo')) {
                            delete vm.data.dateTo;
                        }
                    }
                }

                statementService.update(vm.data);
                vm.setStatementParams();
            }
        });

        vm.setCustomDate = function() {
            vm.data.dateFrom = (new Date(document.getElementById("start").value).getTime()) / 1000 || "";
            vm.data.dateTo = (new Date(document.getElementById("end").value).getTime()) / 1000 || "";
            statementService.update(vm.data);
            vm.setStatementParams();
        }

        // do this on response of any statement request
        $scope.$on('statement:update', (e, _statement, _passthrough) => {
            vm.data.isStatementSet = true;
            vm.transactions.length = 0;
            vm.statement = _statement;
            vm.count = vm.statement.count;
            if (vm.count > 0) {
                $scope.$applyAsync(() => {
                    vm.noTransaction = false;
                });
                vm.items = vm.statement.transactions;
                // enable and disabling previous button
                vm.prevButtonState();
                vm.setTransactions();
            } else {
                $scope.$applyAsync(() => {
                    vm.nextPageDisabled = true;
                    vm.noTransaction = true;
                });
            }
        });

        vm.navigateToOptions = function() {
            statementService.remove();
            $state.go('options');
        }

        // $scope.$on('logout', (e) => {
        //     statementService.remove();
        // });
        // details functions
        vm.sendContractDetailRequest = function(id) {
            vm.id = id;
            localStorage.setItem('id', vm.id);
            $state.go('transactiondetail');
        }
    }
})();
