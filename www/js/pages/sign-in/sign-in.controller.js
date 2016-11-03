/**
 * @name Singin Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/10/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.signin.controllers')
        .controller('SigninController', Signin);

    Signin.$inejct = [
        '$scope',
        '$state',
        '$ionicLoading',
        'accountService',
        'languageService',
        'websocketService',
        'alertService',
        'appStateService'
    ];

    function Signin($scope, $state, $ionicLoading,
        accountService, languageService,
        websocketService, alertService, appStateService
    ) {
        var vm = this;
        vm.showTokenForm = false;
        vm.showSignin = false;
        vm.showSignup = false;
        vm.showvirtualws = false;
        vm.data = {};
        vm.tokenError = false;
        vm.passwordError = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();

        /**
         * On load:
         * Open the websocket
         * If default account is set, send it for validation
         */
        var init = function() {
            vm.language = languageService.read();
        };

        init();


        $scope.$on('authorize', (e, response) => {

            $ionicLoading.hide();

            if (response) {
                if (accountService.isUnique(response.loginid)) {
                    accountService.add(response);
                    accountService.setDefault(response.token);
                    appStateService.virtuality = response.is_virtual;
                }

                vm.token = '';

                $state.go('trade');
            } else {
                alertService.accountError.tokenNotAuthenticated();
            }
        });

        /**
         * SignIn button: event handler
         * @param  {String} _token 15char token
         */
        vm.signIn = function() {
            var _token = vm.token;

            // Validate the token
            if (_token && _token.length === 15) {

                $ionicLoading.show();

                websocketService.authenticate(_token);
            } else {
                alertService.accountError.tokenNotValid();
            }
        };

        vm.changeLanguage = function() {
            languageService.update(vm.language);
        }

        // sign up email verify
        vm.verifyUserMail = function() {
          vm.emailError = false;
          if(vm.data.mail){
            var mail = vm.data.mail;
          }
          else{
            var mail = "";
          }
            websocketService.sendRequestFor.accountOpening(mail);
        }
        $scope.$on('verify_email', (e, verify_email) => {
            vm.userMail = verify_email;
            if (vm.userMail == 1) {
                $scope.$applyAsync(() => {
                    vm.emailError = false;
                });
                $scope.$applyAsync(() => {
                    vm.showvirtualws = true;
                    vm.showSignup = false;
                });
            }
        });
        $scope.$on('verify_email:error', (e, details) => {
            $scope.$applyAsync(() => {
                vm.emailError = true;
                vm.emailErrorMessage = details.verify_email;
            });
        });

        // virtual ws opening
        websocketService.sendRequestFor.residenceListSend();
        $scope.$on('residence_list', (e, residence_list) => {
            if (!appStateService.hasGetResidence) {
                vm.data.residenceList = residence_list;
                appStateService.hasGetResidence = true;
            }
        });

        // Hide & show password function
        vm.data.inputType = 'password';
        vm.hideShowPassword = function() {
            if (vm.data.inputType == 'password')
                vm.data.inputType = 'text';
            else
                vm.data.inputType = 'password';
        };

        vm.createVirtualAccount = function() {
            vm.tokenError = false;
            vm.passwordError = false;
            var verificationCode = vm.data.verificationCode;
            var clientPassword = vm.data.clientPassword;
            var residence = vm.data.residence;
            websocketService.sendRequestFor.newAccountVirtual(verificationCode, clientPassword, residence);
        };
        $scope.$on('new_account_virtual', (e, new_account_virtual) => {
            if (!appStateService.isLoggedin) {
                var _token = new_account_virtual.oauth_token;
                websocketService.authenticate(_token)
            }
        });
        $scope.$on('new_account_virtual:error', (e, error) => {
          $scope.$applyAsync(() => {
            if (error) {
                if (error.hasOwnProperty('details') && error.details.hasOwnProperty('verification_code')) {
                    vm.tokenError = true;
                    vm.tokenErrorMessage = error.details.verification_code || error.code;
                }
                if (error.hasOwnProperty('code') && error.code == "InvalidToken"){
                  vm.tokenError = true;
                  vm.tokenErrorMessage = error.message;
                }
                if (error.hasOwnProperty('details') && error.details.hasOwnProperty('client_password')) {
                  vm.passwordError = true;
                  vm.passwordErrorMessage = error.details.client_password || error.code;
                }
                if (error.hasOwnProperty('code') && error.code == "PasswordError"){
                  vm.passwordError = true;
                  vm.passwordErrorMessage = error.message;
                }
            }
          });
        });

        // change different type of singing methods
        vm.changeSigninView = function(_isBack) {
            _isBack = _isBack || false;

            $scope.$applyAsync(() => {
                if (!vm.showSignin && !vm.showSignup && !vm.showvirtualws && vm.showTokenForm) {
                    vm.showTokenForm = false;
                    vm.showSignin = true;
                } else if (!vm.showSignin && vm.showSignup && !vm.showTokenForm && !vm.showvirtualws) {
                    vm.showSignup = false;
                    vm.showSignin = true;
                } else if (!vm.showSignin && !vm.showSignup && !vm.showTokenForm && vm.showvirtualws) {
                    vm.showvirtualws = false;
                    vm.showSignup = false;
                    vm.showSignin = true;
                } else if (!vm.showSignin && vm.showSignup && !vm.showTokenForm && !vm.showvirtualws) {
                    vm.showvirtualws = false;
                    vm.showSignup = false;
                    vm.showSignin = true;
                } else if (vm.showSignin && !vm.showSignup && !vm.showTokenForm && !vm.showvirtualws && _isBack) {
                    vm.showSignin = false;
                }


            });
        }

        vm.changeSigninViewtoToken = function() {
            if (vm.showSignin && !vm.showTokenForm) {
                vm.showTokenForm = true;
                vm.showSignin = false;
            }
        }

        vm.changeSigninViewtoSignup = function() {
            if (vm.showSignin && !vm.showSignup) {
                vm.showSignup = true;
                vm.showSignin = false;
            }
        }

        vm.showSigninView = function() {
            $scope.$applyAsync(() => {
                vm.showSignin = true;
            });
        }

    }
})();
