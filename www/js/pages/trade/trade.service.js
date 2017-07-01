/**
 * @name trade save
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.services").factory("tradeService", Trade);

    function Trade() {
        const factory = {};

        factory.proposalIsReady = false;

        return factory;
    }
})();
