/**
 * @name reality-check directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.reality-check.directives')
        .directive('bgRealityCheck', RealityCheck);

    function RealityCheck() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/share/components/reality-check/reality-check.template.html',
          
            controller: 'RealityCheckController',
            controllerAs: 'vm'

        };
        return directive;
    }
})();
