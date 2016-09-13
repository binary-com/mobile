/**
 * @name new-account-real controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.new-real-account-opening.components.new-account-real')
        .controller('NewAccountRealController', NewAccountReal);

    NewAccountReal.$inject = ['$scope', '$timeout', '$translate', '$state', '$ionicPopup', 'websocketService', 'appStateService', 'accountService', 'alertService', 'languageService'];

    function NewAccountReal($scope, $timeout, $translate, $state, $ionicPopup, websocketService, appStateService, accountService, alertService, languageService) {
        var vm = this;
        vm.data = {};
        vm.data.countryCode = $rootScope.countryCodeOfAccount;
        vm.data.country = $rootScope.countryOfAccount;

        websocketService.sendRequestFor.statesListSend(vm.data.countryCode);
        $scope.$on('states_list', (e, states_list) => {
            $scope.$applyAsync(() => {
                vm.data.statesList = states_list;
            });
        });


        vm.validateName = (function(val) {
            var regex = /[`~!@#$%^&*)(_=+\[}{\]\\\/";:\?><,|\d]+/;
            return {
                test: function(val) {
                    var reg = regex.test(val);
                    if (reg == true) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }
        })();

        vm.submitAccountOpening = function() {
            if (vm.data.dateOfBirth) {
                var birth = vm.data.dateOfBirth.toISOString().slice(0, 10);
            }
            if (_.isEmpty(vm.data.state)) {
                vm.data.state = "";
            }
            if (_.isEmpty(vm.data.addressLine2)) {
                vm.data.addressLine2 = "";
            }
            if (_.isEmpty(vm.data.addressPostcode)) {
                vm.data.addressPostcode = "";
            }
            var params = {
                "salutation": vm.data.salutation,
                "first_name": vm.data.firstName,
                "last_name": vm.data.lastName,
                "date_of_birth": birth,
                "residence": vm.data.countryCode,
                "address_line_1": vm.data.addressLine1,
                "address_line_2": vm.data.addressLine2,
                "address_city": vm.data.addressCity,
                "address_state": vm.data.state,
                "address_postcode": vm.data.addressPostcode,
                "phone": vm.data.phone,
                "secret_question": vm.data.secretQuestion,
                "secret_answer": vm.data.secretAnswer
            }
            websocketService.sendRequestFor.createRealAccountSend(params);
        };


    }
})();
