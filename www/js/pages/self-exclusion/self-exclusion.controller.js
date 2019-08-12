/**
 * @name self-exclusion module
 * @author Morteza Tavnarad
 * @contributors []
 * @since 11/12/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.self-exclusion.controllers").controller("SelfExclusionController", SelfExclusion);

    SelfExclusion.$inject = [
        "$scope",
        "$state",
        "$filter",
        "$translate",
        "$ionicScrollDelegate",
        "alertService",
        "websocketService",
        "accountService",
        "validationService"
    ];

    function SelfExclusion(
        $scope,
        $state,
        $filter,
        $translate,
        $ionicScrollDelegate,
        alertService,
        websocketService,
        accountService,
        validationService
    ) {
        const vm = this;
        vm.hasError = false;
        vm.validation = validationService;
        vm.fractionalDigits = vm.validation.fractionalDigits;
        vm.disableUpdateButton = true;
        vm.isDataLoaded = false;
        vm.disableForZeroValues = false;
        let isUpdated = false;
        vm.data = {};
        const account = accountService.getDefault();
        vm.country = account.country;
        const noZeroValues = ['max_balance', 'max_turnover', 'max_losses', 'max_7day_turnover', 'max_7day_losses',
            'max_30day_turnover', 'max_30day_losses', 'max_open_bets'];

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
            if (isUpdated) {
                isUpdated = false;
                if (vm.country === 'gb') {
                    $ionicScrollDelegate.scrollBottom();
                }
            }
        });

        $scope.$on("set-self-exclusion:error", (e, error) => {
            alertService.displayError(error);
            vm.disableUpdateButton = false;
        });

        vm.checkZeroValues = () => {
            const hasZeroValue = [];
            _.forEach(noZeroValues, field => {
                if (parseInt(vm.data[field]) === 0) {
                    hasZeroValue.push(field);
                }
            });
            $scope.$applyAsync(() => {
                vm.disableForZeroValues = !!hasZeroValue.length;
            });
        };

        vm.submit = () => {
            vm.disableUpdateButton = true;
            setSelfExclusion();
        };

        const getSelfExclusion = () => websocketService.sendRequestFor.getSelfExclusion();
        const getLimits = () => websocketService.sendRequestFor.accountLimits();

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
            isUpdated = true;
        }

        // yyyy-mm-dd
        const filterDate = (date) => {
            const year  = $filter('date')(date, 'yyyy', 'UTC');
            const month = $filter('date')(date, 'MM', 'UTC');
            const day = $filter('date')(date, 'dd', 'UTC');
            return `${year}-${month}-${day}`;
        }

        const calculateDateLimits = (startingDate = new Date()) => {
            vm.minDateTime = startingDate.toISOString();
            startingDate.setDate(startingDate.getDate() + 1);
            // calculating the min date for 'timeout until' 
            // (6 weeks after tomorrow in format yyyy-mm-dd in UTC)
            const tomorrow = _.clone(startingDate);
            vm.minDate = `${tomorrow.toISOString().slice(0, 10)}T00:00:00`;
            const dateAfterSixWeeks = tomorrow.setDate(tomorrow.getDate() + 41);
            vm.nextSixWeeks = filterDate(dateAfterSixWeeks);
            vm.nextSixWeeksDateTime = `${vm.nextSixWeeks}T23:59:59`

            // calculating the min date for 'exclude until' 
            // (6 month after tomorrow in format yyyy-mm-dd in UTC)
            const dateAfterSixMonths = new Date(startingDate.setMonth(startingDate.getMonth() + 6)).getTime();
            vm.nextSixMonths = filterDate(dateAfterSixMonths);
        };

        $scope.$on('get_limits', (e, limits) => {
            vm.hasError = false;
            vm.accountLimits = limits;
            getSelfExclusion();
        });

        $scope.$on('get_limits:error', () => {
            vm.hasError = true;
        });

        vm.goToContact = () => {
            $state.go('contact');
        };

        $scope.$on('time:success', (e, time) => {
            const startingDate = new Date(time * 1000);
            calculateDateLimits(startingDate);
        });

        $scope.$on('time:error', () => {
            calculateDateLimits();
        });

        const init = () => {
            websocketService.sendRequestFor.serverTime();
            getLimits();
        };
        
        init();

    }
})();
