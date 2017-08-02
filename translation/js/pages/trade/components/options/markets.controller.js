/**
 * @name markets controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/20/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.controllers").controller("MarketsController", Markets);

    Markets.$inject = ["$scope", "websocketService"];

    function Markets($scope, websocketService) {
        const vm = this;
        vm.markets = {};

        function init() {
            if (_.isEmpty(sessionStorage.markets)) {
                setTimeout(init, 500);
                return;
            }

            $scope.$applyAsync(() => {
                vm.markets = JSON.parse(sessionStorage.markets);
            });
        }

        vm.selectMarket = function(market) {
            vm.select()(market);
        };

        init();
    }
})();
