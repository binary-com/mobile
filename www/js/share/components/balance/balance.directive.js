/**
 * @name balance directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.balance.directives").directive("bgBalance", Balance);

    Balance.$inject = ["websocketService"];

    function Balance(websocketService) {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/balance/balance.template.html",
            controller      : "BalanceController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal: "=?"
            },
            link
        };

        function link(scope, element, attributes, vm) {
            scope.$on("$destroy", () => {
                if (vm.balance && vm.balance.id) {
                    websocketService.sendRequestFor.forgetStream(vm.balance.id);
                }
            });
        }

        return directive;
    }
})();
