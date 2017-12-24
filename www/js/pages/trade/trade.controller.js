/**
 * @name trade controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.controllers").controller("TradeController", Trade);

    Trade.$inject = ["proposalService"];

    function Trade(proposalService) {
        const vm = this;

        vm.proposal = {};
        vm.purchasedContract = {};

        function init() {
            vm.proposal = proposalService.get();
        }

        init();

        angular.element(document).ready(() => {
            // if (ionic.Platform.isIOS()) {
            //     document.getElementById("trade-container").style.paddingBottom = "20px";
            // }
            if (!ionic.Platform.isWebView()) {
                const tradeContainer = document.getElementById("trade-container");
                if (tradeContainer !== undefined && tradeContainer !== null) {
                    tradeContainer.className = "web-view-trade";
                }
            }
            window.addEventListener("native.keyboardshow", keyboardShowHandler);
            window.addEventListener("native.keyboardhide", keyboardHideHandler);

            function keyboardShowHandler(e) {
                const tradeContainer = document.getElementById("trade-container");
                if (tradeContainer !== undefined && tradeContainer !== null) {
                    tradeContainer.className = "";
                }
            }

            function keyboardHideHandler(e) {
                const tradeContainer = document.getElementById("trade-container");
                if (tradeContainer !== undefined && tradeContainer !== null) {
                    tradeContainer.className = "flexed";
                }
            }
        });
    }
})();
