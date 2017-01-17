/**
 * @name trayeTypes directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/24/2016
 * @copyright Binary Ltd
 */

(function(){
    'use strict';

    angular
        .module('binary.pages.trade.components.options.directives')
        .directive('bgTradetypes', TradeTypes);

    function TradeTypes(){
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/trade/components/options/trade-types.template.html',
            controller: 'TradeTypesController', 
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                select: "&"
            }
        };

        return directive;
    }
})();
