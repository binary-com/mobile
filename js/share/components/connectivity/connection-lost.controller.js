/**
 * @name Connection Lost Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/19/2016
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.share.components.connectivity.controllers")
        .controller("ConnectionLostController", ConnectionLost);

    ConnectionLost.$inject = ["$scope"];

    function ConnectionLost($scope) {
        const vm = this;

        vm.showMessage = false;

        $scope.$on("connection:ready", e => {
            $scope.$applyAsync(() => {
                vm.showMessage = false;
            });
        });

        $scope.$on("connection:error", (e, isSSLFailed) => {
            $scope.$applyAsync(() => {
                vm.showMessage = true;

                if (isSSLFailed ) {
                    vm.message = 'app.ssl_cert_failed';
                } else {
                    vm.message = 'app.connection_error';
                }
            });
        });
    }
})();
