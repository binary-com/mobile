/**
 * @name spinner-logo controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/17/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.spinner-logo.controllers").controller("SpinnerLogoController", SpinnerLogo);

    SpinnerLogo.$inject = ["$scope"];

    function SpinnerLogo($scope) {
        const vm = this;
        vm.start = false;

        $scope.$on("spinner-logo:start", () => {
            vm.start = true;
        });

        $scope.$on("spinner-logo:stop", () => {
            vm.start = false;
        });
    }
})();
