/**
 * @name Check Financial Assessment directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 01/16/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.check-financial-assessment.directives')
        .directive('bgCheckFinancialAssessment', CheckFinancialAssessment);

    function CheckFinancialAssessment() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/share/components/check-financial-assessment/check-financial-assessment.template.html',
            controller: 'CheckFinancialAssessmentController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
