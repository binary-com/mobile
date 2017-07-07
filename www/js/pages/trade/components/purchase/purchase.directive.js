/**
 * @name purchase directive
 * @author morteza tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright binary ltd
 */

(function() {
    angular.module("binary.pages.trade.components.purchase.directives").directive("bgPurchase", Purchase);

    function Purchase() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/pages/trade/components/purchase/purchase.template.html",
            controller      : "PurchaseController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {
                proposal         : "=",
                purchasedContract: "=",
                showSummary      : "=inPurchaseMode"
            }
        };

        return directive;
    }
})();
