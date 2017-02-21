/**
 * @name account-upgrade directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.share.components.account-upgrade.directives')
        .directive('bgAccountUpgrade', AccountUpgrade);

    function AccountUpgrade() {
        var directive = {
            restrict: 'E',
            templateUrl: 'js/share/components/account-upgrade/account-upgrade.template.html',
            controller: 'AccountUpgradeController',
            controllerAs: 'vm',
            bindToController: true,
            scope: {}

        };
        return directive;
    }
})();
