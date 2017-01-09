/**
 * @name underlyings directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/25/2016
 * @copyright Binary Ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.components.options.directives')
        .directive('bgUnderlyings', Underlying);

    function Underlying(){
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/trade/components/options/underlyings.template.html',
            controller: 'UnderlyingsController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                market: '=',
                select: '&'
            }
        };

        return directive;
    }
})();
