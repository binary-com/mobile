/**
 * @name iOS PWA Prompt Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/11/2018
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module('binary.share.components.ios-pwa-prompt.controllers')
        .controller('IosPwaPromptController', PWAPrompt);

    PWAPrompt.$inject = ['$scope', '$translate', 'alertService'];

    function PWAPrompt($scope, $translate, alertService) {

        const vm = this;
        vm.icon = '<i class="icon ion-ios-upload-outline"></i>';

        vm.showPrompt = () => {
            $translate([
                'ios-pwa-prompt.title',
                'ios-pwa-prompt.close',
            ]).then(translation => {
                const popup = alertService.displayIOSPWAPrompt(
                    translation['ios-pwa-prompt.title'],
                    'ios-paw-prompt',
                    $scope,
                    'js/share/components/ios-pwa-prompt/ios-pwa-prompt.template.html',
                    [
                        {
                            text : translation['ios-pwa-prompt.close'],
                            type : 'button-default',
                            onTap: (e) => {
                                popup.close();
                            },
                        }
                    ]
                );
            });

            localStorage.setItem('lastSeenIOSPWAPrompt', new Date().getTime());
        };

        vm.checkToShowPrompt = () => {
            if (window.navigator.standalone) {
                return false;
            }

            const lastSeen = localStorage.getItem('lastSeenIOSPWAPrompt') || null;
            const diffDays = lastSeen ? (new Date().getTime() - lastSeen) / (86400*1000) : 0;
            const isApple = /IPHONE|IPAD|IPOD/i.test(navigator.appVersion);

            return isApple && isSafari() && (diffDays === 0 || diffDays >= 14);

        };

        vm.init = () => {
            if (vm.checkToShowPrompt()) {
                vm.showPrompt();
            }
        };

        vm.init();

        function isSafari() {
            const ua = window.navigator.userAgent;

            const isNotSafari = /chrome|ucbrowser|fxios|crios/i.test(ua);

            if (!isNotSafari && /safari/i.test(ua)) {
                return true;
            }

            return false;
        }

    }
})();
