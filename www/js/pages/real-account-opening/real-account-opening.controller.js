/**
 * @name new-account-real controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.real-account-opening").controller("RealAccountOpeningController", RealAccountOpening);

    RealAccountOpening.$inject = [
        "$scope",
        "$filter",
        "$ionicModal",
        "websocketService",
        "appStateService",
        "accountService",
        "alertService"
    ];

    function RealAccountOpening(
        $scope,
        $filter,
        $ionicModal,
        websocketService,
        appStateService,
        accountService,
        alertService
    ) {
        const vm = this;
        vm.data = {};
        const currentAccount = accountService.getDefault();
        vm.isReadonly = !currentAccount.id.startsWith('VR');
        vm.hasResidence = false;
        vm.disableUpdatebutton = false;
        vm.data.linkToTermAndConditions = `https://www.binary.com/${localStorage.getItem("language") ||
            "en"}/terms-and-conditions.html`;
        vm.requestData = [
            "salutation",
            "first_name",
            "last_name",
            "date_of_birth",
            "residence",
            "address_line_1",
            "address_line_2",
            "address_city",
            "address_state",
            "address_postcode",
            "phone",
            "secret_question",
            "secret_answer",
            "account_opening_reason"
        ];

        // set all fields errors to false
        vm.resetAllErrors = function() {
            _.forEach(vm.requestData, (value, key) => {
                vm[`${value}_error`] = false;
            });
        };

        $scope.$on("residence_list", (e, residence_list) => {
            vm.residenceList = residence_list;
            websocketService.sendRequestFor.accountSetting();
        });

        $scope.$on("get_settings", (e, get_settings) => {
            _.forEach(get_settings, (val, key) => {
                if (vm.requestData.indexOf(key) > -1) {
                    if (key === "date_of_birth") {
                        vm.data[key] = new Date(val * 1000);
                    } else if (key === "place_of_birth" && val) {
                        vm.hasPlaceOfbirth = true;
                        vm.data[key] = val;
                    } else {
                        vm.data[key] = val;
                    }
                } else if (key === "country_code") {
                    vm.hasResidence = true;
                    vm.data.residence = get_settings.country_code;
                    websocketService.sendRequestFor.statesListSend(vm.data.residence);
                }
            });

            if (!get_settings.hasOwnProperty("phone")) {
                vm.phoneCodeObj = vm.residenceList.find(vm.findPhoneCode);
                if (vm.phoneCodeObj.hasOwnProperty("phone_idd")) {
                    $scope.$applyAsync(() => {
                        vm.data.phone = `+${vm.phoneCodeObj.phone_idd}`;
                    });
                }
            }
        });

        vm.findPhoneCode = function(country) {
            return country.value === vm.data.residence;
        };

        $scope.$on("states_list", (e, states_list) => {
            vm.statesList = states_list;
        });

        // regexp pattern for name input (pattern in perl API doesn't work in javascript)
        vm.validateGeneral = (function(val) {
            const regex = /[`~!@#$%^&*)(_=+[}{\]\\/";:?><|]+/;
            return {
                test(val) {
                    const reg = regex.test(val);
                    return reg !== true;
                }
            };
        })();

        vm.validateAddress = (function(val) {
            const regex = /[`~!$%^&*_=+[}{\]\\"?><|]+/;
            return {
                test(val) {
                    const reg = regex.test(val);
                    return reg !== true;
                }
            };
        })();

        vm.validateSecretAnswer = (function(val) {
            const regex = /[`~!@#$%^&*)(_=+[}{\]\\/";:?><|]+/;
            return {
                test(val) {
                    const reg = regex.test(val);
                    return reg !== true;
                }
            };
        })();

        vm.submitAccountOpening = function() {
            vm.disableUpdatebutton = true;
            vm.resetAllErrors();
            vm.params = {};
            _.forEach(vm.data, (value, key) => {
                if (vm.requestData.indexOf(key) > -1) {
                    if (key === "date_of_birth") {
                        vm.params[key] = $filter("date")(value, "yyyy-MM-dd");
                    } else if (key === "secret_question" || key === "secret_answer") {
                        if (!vm.isReadonly) {
                            vm.params[key] = _.trim(value);
                        }
                    } else {
	                      vm.params[key] = _.trim(value);
                    }
                }
            });
            websocketService.sendRequestFor.createRealAccountSend(vm.params);
        };

        // error handling by backend errors under each input
        $scope.$on("new_account_real:error", (e, error) => {
            vm.disableUpdatebutton = false;
            if (error.hasOwnProperty("details")) {
                $scope.$applyAsync(() => {
                    _.forEach(vm.requestData, (value, key) => {
                        if (error.details.hasOwnProperty(value)) {
                            vm[`${value}_error`] = true;
                            vm[`${value}_error_message`] = error.details[value];
                        }
                    });
                });
            } else if (error.code) {
                alertService.displayError(error.message);
            }
        });

        $scope.$on("new_account_real", (e, new_account_real) => {
            vm.disableUpdatebutton = false;
            websocketService.authenticate(new_account_real.oauth_token);
            vm.selectedAccount = new_account_real.oauth_token;
            appStateService.newAccountAdded = true;
            accountService.addedAccount = vm.selectedAccount;
        });

        vm.openTermsAndConditions = function() {
            window.open(vm.data.linkToTermAndConditions, "_blank");
        };

        vm.init = function() {
            vm.resetAllErrors();
            websocketService.sendRequestFor.residenceListSend();
        };

        vm.init();
    }
})();
