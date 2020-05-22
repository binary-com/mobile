/**
 * @name accounts directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.accounts.directives").directive("bgAccounts", Accounts);

    function Accounts() {
        const directive = {
            restrict       : "E",
            templateUrl    : "js/share/components/accounts/accounts.template.html",
            controller     : "AccountsController",
            controllerAs   : "vm",
            bindToContoller: true,
            scope          : {}
        };

        return directive;
    }
})();
