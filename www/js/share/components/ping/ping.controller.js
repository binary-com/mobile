/**
 * @name ping controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.share.components.ping.controllers").controller("PingController", Ping);

    Ping.$inject = ["$timeout", "appStateService", "websocketService"];

    function Ping($timeout, appStateService, websocketService) {
        function init() {
            ping();
        }

        function ping() {
            if (appStateService.isLoggedin) {
                websocketService.sendRequestFor.ping();
            }

            $timeout(ping, 60000);
        }

        init();
    }
})();
