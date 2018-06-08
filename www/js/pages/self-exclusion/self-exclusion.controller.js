/**
 * @name self-exclusion module
 * @author Morteza Tavnarad
 * @contributors []
 * @since 11/12/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.self-exclusion.controllers").controller("SelfExclusionController", SelfExclusion);

    SelfExclusion.$inject = ["$scope", "$translate", "alertService", "websocketService", "validationService"];

    function SelfExclusion($scope, $translate, alertService, websocketService,
        validationService) {
        const vm = this;
        vm.validation = validationService;
        vm.fractionalDigits = vm.validation.fractionalDigits;
        const today = new Date();
        vm.minDate = today.toISOString().slice(0, 10);
        vm.minDateTime = today.toISOString();
        vm.nextSixWeeks = new Date(today.getTime() + 7 * 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        vm.nextSixMonths = new Date(today.getTime() + 30 * 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        vm.disableUpdateButton = true;
        vm.isDataLoaded = false;
        vm.data = {};

        $scope.$on("get-self-exclusion", (e, response) => {
            $scope.$applyAsync(() => {
                vm.data = _.clone(response);
                if (vm.data.exclude_until) {
                    vm.data.exclude_until = new Date(vm.data.exclude_until);
                }
                vm.limits = _.clone(response);
                vm.disableUpdateButton = false;
                vm.isDataLoaded = true;
            });
        });

        $scope.$on("get-self-exclusion:error", (e, error) => {
            alertService.displayError(error);
            vm.disableUpdateButton = false;
        });

        $scope.$on("set-self-exclusion", (e, response) => {
            $translate(["self-exclusion.success", "self-exclusion.save_prompt"]).then(translation => {
                alertService.displayAlert(
                    translation["self-exclusion.success"],
                    translation["self-exclusion.save_prompt"]
                );
            });
            vm.limits = _.clone(vm.data);
            vm.disableUpdateButton = false;
        });

        $scope.$on("set-self-exclusion:error", (e, error) => {
            alertService.displayError(error);
            vm.disableUpdateButton = false;
        });

        vm.submit = () => {
            vm.disableUpdateButton = true;
            setSelfExclusion();
        };

        const getSelfExclusion = () => websocketService.sendRequestFor.getSelfExclusion();

        const setSelfExclusion = () => {
            const data = _.clone(vm.data);

            if (data.timeout_until) {
                data.timeout_until = new Date(data.timeout_until).getTime() / 1000;
            }

            if (data.exclude_until) {
                data.exclude_until = data.exclude_until.toISOString().slice(0, 10);
            }

            // Convert all numbers to string for supporting number with more than 15 digits
            let stringify = JSON.stringify(data);
            stringify = stringify.replace(/:(\d+)([,}])/g, ':"$1"$2');
            websocketService.sendRequestFor.setSelfExclusion(JSON.parse(stringify));
        }

        const init = () => getSelfExclusion();

        init();

    }
})();
