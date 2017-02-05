/**
 * @name terms and conditions directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 12/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.terms-and-conditions.directives')
        .directive('bgTermsAndConditions', TermsAndConditions);

    function TermsAndConditions() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/terms-and-conditions/terms-and-conditions.template.html',
            controller: 'TermsAndConditionsController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
