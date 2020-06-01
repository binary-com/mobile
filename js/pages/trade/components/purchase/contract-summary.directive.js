/**
 * @name contract-summary directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 09/07/2016
 * @copyright binary ltd
 */

(function() {
    angular.module("binary.pages.trade.components.purchase.directives").directive("bgContractSummary", Summary);

    function Summary() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/purchase/contract-summary.template.html",
            controller      : "ContractSummaryController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal         : "=",
                purchasedContract: "="
            }
        };

        return directive;
    }
})();
