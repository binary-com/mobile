/**
 * @name Asset Index controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/26/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.asset-index.controllers").controller("AssetIndexController", AssetIndex);

    AssetIndex.$inject = ["$scope", "$q"];

    function AssetIndex($scope, $q) {
        const vm = this;
        vm.hasError = false;
        vm.assetIndex = JSON.parse(sessionStorage.asset_index || null);
        vm.activeSymbols = JSON.parse(sessionStorage.all_active_symbols);

        vm.getSymbolInfo = (qSymbol, activeSymbols) => _.filter(activeSymbols, (sy, id) => sy.symbol === qSymbol);

        vm.getAssetIndexData = function(assetIndex, activeSymbols) {
            if (!assetIndex || !activeSymbols) {
                return false;
            }

            vm.marketColumns = {};

            const idx = {
                symbol         : 0,
                displayName    : 1,
                cells          : 2,
                cellName       : 0,
                cellDisplayName: 1,
                cellFrom       : 2,
                cellTo         : 3,
                symInfo        : 3,
                values         : 4
            };

            for (let i = 0; i < assetIndex.length; i++) {
                vm.assetItem = assetIndex[i];
                vm.symbolInfo = vm.getSymbolInfo(vm.assetItem[idx.symbol], activeSymbols)[0];
                if (vm.symbolInfo) {
                    const market = vm.symbolInfo.market;

                    vm.assetItem.push(vm.symbolInfo);

                    if (!(market in vm.marketColumns)) {
                        vm.marketColumns[market] = {
                            header     : [],
                            columns    : [],
                            sub        : [],
                            displayName: vm.symbolInfo.market_display_name
                        };
                    }

                    vm.assetCells = vm.assetItem[idx.cells];
                    const values = {};
                    for (let j = 0; j < vm.assetCells.length; j++) {
                        const col = vm.assetCells[j][idx.displayName];
                        values[col] = `${vm.assetCells[j][idx.cellFrom]} - ${vm.assetCells[j][idx.cellTo]}`;
                        const marketCols = vm.marketColumns[market];
                        if (marketCols.columns.indexOf(col) < 0) {
                            marketCols.header.push(vm.assetCells[j][idx.cellDisplayName]);
                            marketCols.columns.push(col);
                        }
                    }
                    vm.assetItem.push(values);
                }
            }
            vm.assetIndex = assetIndex;
            return vm.assetIndex;
        };
        vm.getMarketColumns = function() {
            $scope.$applyAsync(() => {
                if (vm.marketColumns) {
                    vm.selectedMarket = Object.getOwnPropertyNames(vm.marketColumns)[0];
                }
            });
            vm.hasError = false;
            return vm.marketColumns;
        };

        vm.getSubmarketTable = function(marketColumns, assetIndex) {
            vm.submarketNames = {};
            if (assetIndex) {
                for (let i = 0; i < assetIndex.length; i++) {
                    const assetItem = assetIndex[i];
                    if (assetItem[3]) {
                        const symInfo = assetItem[3];
                        const marketId = symInfo.market;
                        const subMarketId = symInfo.submarket;
                        const submarketDisplayName = symInfo.submarket_display_name;
                        if (marketColumns[marketId].sub.indexOf(subMarketId) < 0) {
                            marketColumns[marketId].sub.push(subMarketId);
                            vm.submarketNames[subMarketId] = submarketDisplayName;
                        }
                    }
                }
            }
        };
        vm.getAssetIndexData(vm.assetIndex, vm.activeSymbols);
        const promise = $q(resolve => {
            if (vm.getMarketColumns()) resolve();
        });
        promise.then(() => {
            vm.getSubmarketTable(vm.marketColumns, vm.assetIndex);
            vm.hasError = false;
        });
    }
})();
