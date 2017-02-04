/**
 * @name trade controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/27/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.trade.controllers')
        .controller('TradeController', Trade);

    Trade.$inject = [
        '$scope', 'proposalService',
        'tradeService', 'websocketService', 'alertService'
    ];

    function Trade($scope, proposalService,
        tradeService, websocketService, alertService) {
        var vm = this;

        vm.proposal = {};
        vm.purchasedContract = {};

        function init() {
            vm.proposal = proposalService.get();
        }


        init();

        angular.element(document).ready(function() {
            if (ionic.Platform.isIOS()) {
                document.getElementById('trade-container').style.paddingBottom = '20px';
            }
            if(!ionic.Platform.isWebView()) {
              var tradeContainer = document.getElementById('trade-container');
              if (tradeContainer !== undefined && tradeContainer !== null) {
                  tradeContainer.className = "";
              }
            }
            window.addEventListener('native.keyboardshow', keyboardShowHandler);
            window.addEventListener('native.keyboardhide', keyboardHideHandler);

            function keyboardShowHandler(e) {
                var tradeContainer = document.getElementById('trade-container');
                if (tradeContainer !== undefined && tradeContainer !== null) {
                    tradeContainer.className = "";
                }

            }

            function keyboardHideHandler(e) {
                var tradeContainer = document.getElementById('trade-container');
                if (tradeContainer !== undefined && tradeContainer !== null) {
                    tradeContainer.className = "flexed";
                }
            }

        });


    }
})();
