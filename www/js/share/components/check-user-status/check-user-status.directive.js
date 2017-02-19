/**
 * @name Check User Status directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 02/15/2017
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.check-user-status.directives')
        .directive('bgCheckUserStatus', CheckUserStatus);

    function CheckUserStatus() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/share/components/check-user-status/check-user-status.template.html',
            controller: 'CheckUserStatusController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
