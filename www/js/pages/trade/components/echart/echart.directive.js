/**
 * @name chart directive
 * @author morteza tavnarad
 * @contributors []
 * @since 06/04/2017
 * @copyright binary ltd
 */

(function(){
    'use strict';
    angular
        .module('binary.pages.trade.components.echart.directives')
        .directive('bgChart', Chart);

    function Chart(){
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/trade/components/echart/echart.template.html',
            controller: 'ChartController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {
                proposal: '=',
                purchasedContract: '='
            }
        };

        return directive;
    }

})();

