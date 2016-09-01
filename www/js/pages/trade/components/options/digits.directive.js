/**
 * @name digits directvie
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/26/2016
 * @copyright Binary Ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.components.options.directives')
        .directive('bgDigits', Digits);

    function Digits(){
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/trade/components/options/digits.template.html',
            controller: 'DigitsController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                select: '&',
                tradeType: '='
            }
        };

        return directive;
    }
})();
