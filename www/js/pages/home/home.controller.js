/**
 * @name HomeController
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/9/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.home.controllers").controller("HomeController", Home);

    Home.$inject = ["$scope", "$state", "accountService", "analyticsService", "appStateService"];

    function Home($scope, $state, accountService, analyticsService, appStateService) {
        const vm = this;
        /**
        * wait untile authorization and decide
        * to redirect user  to the proper page
        */
        $scope.$on("authorize", (e, response) => {
            if (response) {
                setTimeout(() => {
                    $state.go("trade");
                }, 1000);
            } else {
                $state.go("signin");
            }
        });

        const init = () => {
            // send track view to Google Analytics
            analyticsService.google.trackView("Home");

            // Check that is saved any default account or not
            if (accountService.hasDefault()) {
                // Login to the server if there is any default account
                if (!appStateService.isLoggedin) {
                    accountService.validate();
                } else {
                    $state.go("trade");
                }
            } else {
                accountService.removeAll();
                $state.go("signin");
            }
        };

        init();
    }
})();
