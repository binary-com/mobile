/**
 * @name account-upgrade directive
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.account-upgrade.directives").directive("bgAccountUpgrade", AccountUpgrade);

    function AccountUpgrade() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/account-upgrade/account-upgrade.template.html",
            controller      : "AccountUpgradeController",
            controllerAs    : "vm",
            bindToController: true,
            scope           : {}
        };
        return directive;
    }
})();
