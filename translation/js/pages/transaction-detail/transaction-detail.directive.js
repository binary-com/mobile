/**
 * @name transaction-detail directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.transaction-detail.directives')
        .directive('bgTransactionDetail', TransactionDetail);

    function TransactionDetail() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/transaction-detail/transaction-detail.template.html',
            controller: 'TransactionDetailController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
