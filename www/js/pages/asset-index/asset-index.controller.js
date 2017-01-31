/**
 * @name Asset Index controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/26/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.asset-index.controllers')
        .controller('AssetIndexController', AssetIndex);

    AssetIndex.$inject = ['$scope', '$rootScope', '$filter', '$q', '$timeout', 'websocketService'];

    function AssetIndex($scope, $rootScope, $filter, $q, $timeout, websocketService) {
        var vm = this;
        vm.hasError = false;
        vm.marketColumns;
        vm.assetIndex = JSON.parse(sessionStorage.asset_index || null);
        vm.activeSymbols = JSON.parse(sessionStorage.all_active_symbols);

        vm.getSymbolInfo = function(qSymbol, activeSymbols) {
            return activeSymbols.filter(function(sy, id) {
                if (sy.symbol === qSymbol) {
                    activeSymbols.splice(id, 1);
                    return true;
                }
            });
        };

        vm.getAssetIndexData = function(assetIndex, activeSymbols) {
            if (!assetIndex || !activeSymbols) return;

            vm.marketColumns = {};

            var idx = {
                symbol: 0,
                displayName: 1,
                cells: 2,
                cellName: 0,
                cellDisplayName: 1,
                cellFrom: 2,
                cellTo: 3,
                symInfo: 3,
                values: 4
            };

            for (var i = 0; i < assetIndex.length; i++) {
                vm.assetItem = assetIndex[i];
                vm.symbolInfo = vm.getSymbolInfo(vm.assetItem[idx.symbol], activeSymbols)[0];
                if (!vm.symbolInfo) {
                    continue;
                }
                var market = vm.symbolInfo.market;

                vm.assetItem.push(vm.symbolInfo);

                if (!(market in vm.marketColumns)) {
                    vm.marketColumns[market] = {
                        header: [],
                        columns: [],
                        sub: []
                    };
                }

                vm.assetCells = vm.assetItem[idx.cells];
                    var values = {};
                for (var j = 0; j < vm.assetCells.length; j++) {
                    var col = vm.assetCells[j][idx.cellName];
                    values[col] = vm.assetCells[j][idx.cellFrom] + ' - ' + vm.assetCells[j][idx.cellTo];
                    var marketCols = vm.marketColumns[market];
                    if (marketCols.columns.indexOf(col) === -1) {
                        marketCols.header.push(vm.assetCells[j][idx.cellDisplayName]);
                        marketCols.columns.push(col);
                    }

                }
                vm.assetItem.push(values);

            }
            vm.assetIndex = assetIndex;
            return vm.assetIndex;
        };
        vm.getMarketColumns = function() {
            $scope.$applyAsync(() => {
                vm.selectedMarket = Object.getOwnPropertyNames(vm.marketColumns)[0];
            });
            vm.hasError = false;
            return vm.marketColumns;
        }

        vm.getSubmarketTable = function(marketColumns, assetIndex) {
            vm.submarketNames = {};
            if (assetIndex) {
                for (var i = 0; i < assetIndex.length; i++) {
                    var assetItem = assetIndex[i];
                    if (assetItem[3]) {
                        var symInfo = assetItem[3];
                        var marketId = symInfo.market;
                        var subMarketId = symInfo.submarket;
                        var submarketDisplayName = symInfo.submarket_display_name;
                        if (marketColumns[marketId].sub.indexOf(subMarketId) < 0) {
                            marketColumns[marketId].sub.push(subMarketId);
                            vm.submarketNames[subMarketId] = submarketDisplayName;
                        }
                    }
                }
            }
        }
        vm.getAssetIndexData(vm.assetIndex, vm.activeSymbols);
        var promise = $q((resolve) => {
            vm.getMarketColumns();
            resolve();
        });
        promise.then(function() {
            vm.getSubmarketTable(vm.marketColumns, vm.assetIndex);
            vm.hasError = false;
        })
    }
})();
