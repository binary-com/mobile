/**
 * @name statement directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.statement.directives')
        .directive('bgStatement', Statement);

    function Statement() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/statement/statement.template.html',
            scope: {},
            bindToController: {
              data : "="
            },
            controller: 'StatementController',
            controllerAs: 'vm',

        };
        return directive;
    }
})();
