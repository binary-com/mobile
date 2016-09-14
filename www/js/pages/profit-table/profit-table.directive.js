/**
 * @name profit-table directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.profit-table.directives')
        .directive('bgProfitTable', ProfitTable);

    function ProfitTable() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/profit-table/profit-table.template.html',
            controller: 'ProfitTableController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
