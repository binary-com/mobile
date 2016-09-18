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

    ProfitTable.$inject = ['$scope', '$filter', '$timeout', '$translate', '$state', 'languageService', 'profitTableService', 'accountService', 'websocketService', 'appStateService'];

    function ProfitTable($scope, $filter, $timeout, $translate, $state, languageService, profitTableService, accountService, websocketService, appStateService) {
        var vm = this;
        vm.data = {};
        vm.itemsPerPage = 5;
        vm.itemsFirstCall = vm.itemsPerPage + 1;
        vm.nextPageDisabled = true;
        vm.prevPageDisabled = true;
        vm.customDateEnabled = false;
        vm.transactions = [];
        vm.noTransaction = false;
        vm.data = {};
        vm.data.isProfitTableSet = false;
        $translate(['profittable.all_apps', 'profittable.tick_trade_app', 'profittable.all_time', 'profittable.last_month', 'profittable.last_week', 'profittable.last_3_days', 'profittable.last_day', 'profittable.today'])
        .then((translation) => {
            vm.apps = [
              {
                label: "allApps",
                text: translation['profittable.all_apps']
              },
              {
                label: "tickTradeApp",
                text: translation['profittable.tick_trade_app']
              }
            ];
            vm.dates = [
              {
                label: "allTime",
                text: translation['profittable.all_time']
              },
              {
                label: "monthAgo",
                text: translation['profittable.last_month']
              },
              {
                label: "sevenDayAgo",
                text: translation['profittable.last_week']
              },
              {
                label: "threeDayAgo",
                text: translation['profittable.last_3_days']
              },
              {
                label: "oneDayAgo",
                text: translation['profittable.last_day']
              },
              {
                label: "today",
                text: translation['profittable.today']
              }
            ];
        });

        // refresh table and filters on changing account
        $scope.$on('changedAccount', () => {
            if (appStateService.isChangedAccount) {
                appStateService.isChangedAccount = false;
                profitTableService.remove();
                if (vm.data.isProfitTableSet) {
                    vm.setDefaultParams();
                }
            }
        });

        // function of sending profit table request through websocket
        vm.setProfitTableParams = function() {
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
                websocketService.sendRequestFor.profitTable(vm.params);
            }
            // check if user is loggedin for preventing errors on page refresh
            // send request for profit table for the first time
        vm.sendProfitTableRequest = function() {
            if (appStateService.isLoggedin) {
                if (!vm.data.isProfitTableSet) {
                    vm.setProfitTableParams();
                    profitTableService.update(vm.data);
                } else if (vm.data.isProfitTableSet || appStateService.isChangedAccount) {
                    appStateService.isChangedAccount = false;
                    vm.setProfitTableParams();
                    profitTableService.update(vm.data);
                }
            } else {
                $timeout(vm.sendProfitTableRequest, 500);
            }
        }

        vm.setDefaultParams = function() {
            if (_.isEmpty(localStorage.profitTableState)) {
                vm.data.currentPage = 0;
                vm.data.appID = 'allApps';
                vm.data.dateType = 'allTime';
            } else {
                vm.data = profitTableService.get();
                if (vm.data.dateType == 'customDate') {
                    $scope.$applyAsync(() => {
                        document.getElementById("start").value = $filter('date')(new Date(vm.data.dateFrom * 1000).toISOString().slice(0, 10), 'yyyy-MM-dd');
                        document.getElementById("end").value = $filter('date')(new Date(vm.data.dateTo * 1000).toISOString().slice(0, 10), 'yyyy-MM-dd');
                        vm.customDateEnabled = true;
                    });
                    profitTableService.update(vm.data);
                }
            }
            return vm.sendProfitTableRequest();
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
                profitTableService.update(vm.data);
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
            if (vm.data.isProfitTableSet) {
                vm.setProfitTableParams();
                profitTableService.update(vm.data);
            }
        });
        $scope.$watch("vm.data.appID", () => {
            profitTableService.update(vm.data);
        });

        $scope.$watch("vm.data.dateType", () => {

            // preventing from multiple requests at page load
            if (vm.data.isProfitTableSet) {

                if (vm.data.dateType == 'customDate') {
                    vm.customDateEnabled = true;
                    if (vm.data.isProfitTableSet) {
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
                vm.transactions = [];
                vm.data.currentPage = 0;
                profitTableService.update(vm.data);
                vm.setProfitTableParams();
            }
        });

        vm.setCustomDate = function() {
            vm.data.dateFrom = (new Date(document.getElementById("start").value).getTime()) / 1000 || "";
            vm.data.dateTo = (new Date(document.getElementById("end").value).getTime()) / 1000 || "";
            profitTableService.update(vm.data);
            vm.setProfitTableParams();
        }

        // do this on response of any profitTable request
        $scope.$on('profit_table:update', (e, _profitTable, _passthrough) => {
            vm.data.isProfitTableSet = true;
            vm.transactions.length = 0;
            vm.profitTable = _profitTable;
            vm.count = vm.profitTable.count;
            if (vm.count > 0) {
                $scope.$applyAsync(() => {
                    vm.noTransaction = false;
                });
                vm.items = vm.profitTable.transactions;
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
            profitTableService.remove();
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
