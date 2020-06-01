/**
 * @name accept terms and conditions controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 12/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular
        .module("binary.pages.terms-and-conditions.controllers")
        .controller("TermsAndConditionsController", TermsAndConditions);

    TermsAndConditions.$inject = ["$scope", "$state", "websocketService", "alertService"];

    function TermsAndConditions($scope, $state, websocketService, alertService) {
        const vm = this;
        vm.data = {};
        vm.data.landingCompanyName = localStorage.getItem("landingCompanyName");
        vm.data.linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
            "en"}/terms-and-conditions.html`;

        vm.updateUserTermsAndConditions = () =>
            websocketService.sendRequestFor.TAndCApprovalSend();

        vm.openTermsAndConditions = () => {
            window.open(vm.data.linkToTermAndConditions, "_blank");
        }

        $scope.$on("tnc_approval", (e, tnc_approval) => {
            if (tnc_approval === 1) {
                $state.go("trade");
            }
        });

        $scope.$on("tnc_approval:error", (e, error) => {
            alertService.displayError(error.message);
        });
    }
})();
