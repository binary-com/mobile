/**
 * @name accept terms and conditions directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 12/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.accept-terms-and-conditions.directives')
        .directive('bgAcceptTermsAndConditions', AcceptTermsAndConditions);

    function AcceptTermsAndConditions() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/pages/accept-terms-and-conditions/accept-terms-and-conditions.template.html',
            controller: 'AcceptTermsAndConditionsController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
