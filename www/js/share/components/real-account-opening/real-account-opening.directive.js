/**
 * @name real-account-opening directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.real-account-opening.directives')
        .directive('bgRealAccountOpening', RealAccountOpening);

    function RealAccountOpening() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/share/components/real-account-opening/real-account-opening.template.html',
            controller: 'RealAccountOpeningController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
