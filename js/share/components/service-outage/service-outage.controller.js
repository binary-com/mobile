/**
 * @name Service Outage Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 05/06/2017
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.service-outage.controllers")
        .controller("ServiceOutageController", ServiceOutage);

    ServiceOutage.$inject = ["$scope", "$state", "appStateService", "websocketService"];

    function ServiceOutage($scope, $state, appStateService, websocketService) {
        $scope.$on("website_status", (e, message) => {
            if (message.site_status && message.site_status === "up" && appStateService.siteStatus === "down") {
                appStateService.siteStatus = message.site_status;
                $state.go("trade");
            } else if (message.site_status && message.site_status === "down") {
                appStateService.siteStatus = message.site_status;
                $state.go("outage", { message: message.message });
            }

        });

        $scope.$on("$stateChangeStart", (e, toState, toParams, fromState, fromParams, options) => {
            if (appStateService.siteStatus === "down") {
                if (fromState.name === "outage" || toState.name !== "outage") {
                    e.preventDefault();
                }
            }
        });

        init();

        function init() {
            websocketService.sendRequestFor.websiteStatus(true);
        }
    }
})();
