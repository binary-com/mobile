/**
 * @name session-timout controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 02/04/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.self-exclusion.controllers").controller("SessionTimeoutController", SessionTimeout);

    SessionTimeout.$inject = ["$scope", "$translate", "alertService", "websocketService"];

    function SessionTimeout($scope, $translate, alertService, websocketService) {
        const vm = this;
        let timeoutHasSet = false;
        let loginTime = 0;
        let sessionLimit = null;

        $scope.$on("authorize", (e, response) => {
            loginTime = new Date().getTime();
            websocketService.sendRequestFor.getSelfExclusion();
            timeoutHasSet = false;
        });

        $scope.$on("get-self-exclusion", (e, response) => {
            if (response.session_duration_limit && !timeoutHasSet) {
                timeoutHasSet = true;
                sessionLimit = response.session_duration_limit * 60 * 1000;
                checkSessionDuration();
            }
        });

        function checkSessionDuration() {
            const now = new Date().getTime();
            let remained = loginTime + sessionLimit - now;
            const maxLimit = Math.pow(2, 31) - 1;
            const warning = 10 * 1000;

            if (remained < 0) {
                remained = warning;
            }

            const logout = () => {
                $translate(["self-exclusion.warning", "self-exclusion.session_timeout_warning"]).then(translation => {
                    alertService.displayAlert(
                        translation["self-exclusion.warning"],
                        translation["self-exclusion.session_timeout_warning"]
                    );
                });
                setTimeout(() => {
                    websocketService.logout();
                }, warning);
            };

            if (remained > maxLimit) {
                remained %= maxLimit;
                setTimeout(checkSessionDuration, remained);
            } else {
                setTimeout(logout, remained - warning);
            }
        }
    }
})();
