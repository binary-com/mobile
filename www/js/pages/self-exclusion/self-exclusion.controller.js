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
        vm.isReadonlyExcludeUntil = false;
        let isUpdated = false;
        vm.data = {};
        const account = accountService.getDefault();
        vm.country = account.country;
        const noZeroValues = ['max_balance', 'max_turnover', 'max_losses', 'max_7day_turnover', 'max_7day_losses',
            'max_30day_turnover', 'max_30day_losses', 'max_open_bets'];

        $scope.$on("get-self-exclusion", (e, response) => {
            $scope.$applyAsync(() => {
                const data = _.clone(response);
                if (data.exclude_until) {
                    data.exclude_until = new Date(`${data.exclude_until}T00:00:00`);
                    vm.isReadonlyExcludeUntil = true;
                }
                if (data.timeout_until) data.timeout_until = new Date(data.timeout_until * 1000);
                vm.data = data;
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
                data.timeout_until = Math.floor(new Date(data.timeout_until).getTime() / 1000);
            }

            if (data.exclude_until) {
                data.exclude_until = filterDate(new Date(data.exclude_until).getTime());
            }

            // Convert all numbers to string for supporting number with more than 15 digits
            let stringify = JSON.stringify(data);
            stringify = stringify.replace(/:(\d+)([,}])/g, ':"$1"$2');
            websocketService.sendRequestFor.setSelfExclusion(JSON.parse(stringify));
            isUpdated = true;
        }

        // yyyy-mm-dd
        const filterDate = (date) => $filter('date')(date, 'yyyy-MM-dd');

        const filterTime = (date) => $filter('date')(date, 'HH:mm');
        
        const filterDateTime = (date) => {
            const filteredDate = filterDate(date);
            const filteredTime = filterTime(date);
            return `${filteredDate}T${filteredTime}`;
        }

        const addWeeks = (startingDate, weeks) => {
            const date = _.clone(startingDate);
            const exactTime = filterTime(date);
            const dateAfterWeeks = date.setDate(date.getDate() + weeks * 7);
            return {
                limit: `${filterDate(dateAfterWeeks)}T${exactTime}`,
                text : `${filterDate(dateAfterWeeks)} at ${exactTime}`
            };
        }

        const addMonth = (startingDate, month) => {
            const date = _.clone(startingDate);
            date.setDate(date.getDate() + 1);
            const dateAfterMonths = new Date(date.setMonth(date.getMonth() + month)).getTime();
            return filterDate(dateAfterMonths);
        }

        const addYears = (startingDate, years) => {
            const date = _.clone(startingDate);
            const dateAfterYears = new Date(date.setDate(date.getDate() +  years * 365)).getTime();
            return filterDate(dateAfterYears);
        }

        const getCurrentDateTime = (startingDate) => {
            const date = _.clone(startingDate);
            const now = new Date(date).getTime();
            return filterDateTime(now);
        }

        const calculateDateLimits = (startingDate = new Date()) => {
            vm.minTimeoutUntil = getCurrentDateTime(startingDate);
            // calculating the min date for 'timeout until' 
            // (6 weeks after tomorrow in format yyyy-mm-dd)
            vm.maxTimeoutUntil = addWeeks(startingDate, 6);

            // calculating the min date for 'exclude until' 
            // (6 month after tomorrow in format yyyy-mm-dd)
            vm.minExcludeUntil = addMonth(startingDate, 6);
            // calculating the max date for 'exclude until'
            // we add 5 * 365 = 1825 days instead of years to be exactly like API 
            // otherwise it will have more days considering leap years
            vm.maxExcludeUntil = addYears(startingDate, 5);
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
