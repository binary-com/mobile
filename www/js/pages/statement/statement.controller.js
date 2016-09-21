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

    Statement.$inject = ['$scope', '$filter', '$timeout', '$translate', '$state', 'languageService', 'statementService', 'accountService', 'websocketService', 'appStateService', 'currencyToSymbolService'];

    function Statement($scope, $filter, $timeout, $translate, $state, languageService, statementService, accountService, websocketService, appStateService, currencyToSymbolService) {
        var vm = this;
        vm.data = {};
        vm.itemsPerPage = 7;
        vm.itemsFirstCall = vm.itemsPerPage + 1;
        vm.nextPageDisabled = true;
        vm.prevPageDisabled = true;
        vm.customDateEnabled = false;
        vm.transactions = [];
        vm.noTransaction = false;
        vm.data = {};
        vm.data.isStatementSet = false;

        vm.currency = sessionStorage.getItem('currency');
        vm.formatMoney = function(currency, amount){
          return currencyToSymbolService.formatMoney(currency, amount);
        }

        $translate(['statement.all_apps', 'statement.tick_trade_app', 'statement.all_time', 'statement.last_month', 'statement.last_week', 'statement.last_3_days', 'statement.last_day', 'statement.today'])
        .then((translation) => {
            vm.apps = [
              {
                label: "allApps",
                text: translation['statement.all_apps']
              },
              {
                label: "tickTradeApp",
                text: translation['statement.tick_trade_app']
              }
            ];
            vm.dates = [
              {
                label: "allTime",
                text: translation['statement.all_time']
              },
              {
                label: "monthAgo",
                text: translation['statement.last_month']
              },
              {
                label: "sevenDayAgo",
                text: translation['statement.last_week']
              },
              {
                label: "threeDayAgo",
                text: translation['statement.last_3_days']
              },
              {
                label: "oneDayAgo",
                text: translation['statement.last_day']
              },
              {
                label: "today",
                text: translation['statement.today']
              }
            ];

        });

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
            // preventing from multiple requests at page load
            if (vm.data.isStatementSet) {
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
                vm.transactions = [];
                vm.data.currentPage = 0;
                statementService.update(vm.data);
                vm.setStatementParams();
            }
        });

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
                    vm.prevButtonState();
                    vm.nextPageDisabled = true;
                    vm.noTransaction = true;
                });
            }
        });

        vm.navigateToOptions = function() {
            statementService.remove();
            $state.go('options');
        }

        // details functions
        vm.sendContractDetailRequest = function(id) {
            vm.id = id;
            localStorage.setItem('id', vm.id);
            $state.go('transactiondetail');
        }
    }
})();
