/**
 * @name manage-accounts directive
 * @author
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.manage-accounts.directives')
        .directive('bgManageAccounts', ManageAccounts);

    function ManageAccounts() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/share/components/manage-accounts/manage-accounts.template.html',
            controller: 'ManageAccountsController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
