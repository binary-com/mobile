/**
 * @name options controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/21/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade", [
        "binary.pages.trade.components",
        "binary.pages.trade.controllers",
        "binary.pages.trade.services"
    ]);

    angular.module("binary.pages.trade.components", [
        "binary.pages.trade.components.options",
        "binary.pages.trade.components.chart",
        "binary.pages.trade.components.payout",
        "binary.pages.trade.components.purchase",
        "binary.pages.trade.components.longcode"
    ]);

    angular.module("binary.pages.trade.controllers", []);

    angular.module("binary.pages.trade.services", []);
})();
