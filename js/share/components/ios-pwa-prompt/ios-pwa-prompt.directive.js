/**
 * @name iOS PWA Prompt Directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/11/2018
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module('binary.share.components.ios-pwa-prompt.directives')
        .directive('iosPwaPrompt', PWAPrompt);

    function PWAPrompt() {
        const directive = {
            restrict        : 'E',
            controller      : 'IosPwaPromptController',
            controllerAs    : 'vm',
            bindToController: true,
            scope           : {}
        };

        return directive;
    }
})();
