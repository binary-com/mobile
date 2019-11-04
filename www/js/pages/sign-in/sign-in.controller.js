/**
 * @name Singin Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/10/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.signin.controllers").controller("SigninController", Signin);

    Signin.$inejct = [
        "$scope",
        "$state",
        "$stateParams",
        "$ionicLoading",
        "accountService",
        "languageService",
        "websocketService",
        "alertService",
        "appStateService",
        "validationService"
    ];

    function Signin(
        $scope,
        $state,
        $stateParams,
        $ionicLoading,
        accountService,
        languageService,
        websocketService,
        alertService,
        appStateService,
        validationService
    ) {
        const vm = this;
        vm.validation = validationService;
        vm.showTokenForm = false;
        vm.showSignin = false;
        vm.showSignup = false;
        vm.showvirtualws = false;
        vm.data = {};
        vm.tokenError = false;
        vm.passwordError = false;
        vm.ios = ionic.Platform.isIOS();
        vm.android = ionic.Platform.isAndroid();
        vm.disableNextbutton = false;
        vm.clientCountryIsUK = false;
        vm.linkToRegulatory = `https://www.binary.com/${localStorage.getItem("language") || "en"}/regulation.html`;
        vm.gamStopLink = "https://www.gamstop.co.uk/";

        /**
         * On load:
         * Open the websocket
         * If default account is set, send it for validation
         */
        const init = () => {
            vm.language = languageService.read();

            // Checking url params to get accoutn tokens from /redirect.
            if (!_.isEmpty($stateParams.accountTokens)) {
                vm.showSignin = true;
                vm.data.accountTokens = $stateParams.accountTokens;
            }

            // Checking the url param to get verficatoin code.
            if (!_.isEmpty($stateParams.verificationCode)) {
                vm.showvirtualws = true;
                vm.data.verificationCode = $stateParams.verificationCode;
                websocketService.sendRequestFor.residenceListSend();
            }
        };

        init();

        $scope.$on("authorize", (e, response, message) => {
            $ionicLoading.hide();
            if (response) {
                if (accountService.isUnique(response.loginid)) {
                    let account = {};
                    const accountList = response.account_list;
                    if (accountList) {
                        const acc = _.find(accountList, a => a.loginid === response.loginid);
                        account = _.assign(response, acc);
                    }
                    accountService.add(account);
                    accountService.setDefault(response.token);
                    appStateService.virtuality = response.is_virtual;
                }
                vm.token = "";
                $state.go("trade");
            } else {
                alertService.accountError.tokenNotAuthenticated(message);
            }
        });

        /**
         * SignIn button: event handler
         * @param  {String} _token 15char token
         */
        vm.signIn = () => {
            const _token = vm.token;
            // Validate the token
            if (_token && _token.length === 15) {
                $ionicLoading.show();
                websocketService.authenticate(_token);
            } else {
                alertService.accountError.tokenNotValid();
            }
        };

        // sign up email verify
        vm.verifyUserMail = () => {
            vm.emailError = false;
            const mail = vm.data.mail ? vm.data.mail : "";
            websocketService.sendRequestFor.accountOpening(_.trim(vm.data.mail));
            vm.isVerifyingEmail = true;
        };

        $scope.$on("verify_email", (e, verify_email) => {
            if (verify_email === 1) {
                $scope.$applyAsync(() => {
                    vm.emailError = false;
                    vm.showvirtualws = true;
                    vm.showSignup = false;
                    vm.isVerifyingEmail = false;
                });
            }
        });

        $scope.$on("verify_email:error", (e, details) => {
            $scope.$applyAsync(() => {
                vm.emailError = true;
                vm.emailErrorMessage = details.verify_email;
                vm.isVerifyingEmail = false;
            });
        });

        // virtual ws opening
        $scope.$watch("vm.showSignup", () => {
            if (vm.showSignup) {
                websocketService.sendRequestFor.residenceListSend();
            }
        });

        $scope.$on("residence_list", (e, residence_list) => {
            vm.data.residenceList = residence_list;
        });

        // Hide & show password function
        vm.data.inputType = "password";
        vm.hideShowPassword = () => {
            if (vm.data.inputType === "password") vm.data.inputType = "text";
            else vm.data.inputType = "password";
        };

        vm.createVirtualAccount = () => {
            vm.tokenError = false;
            vm.passwordError = false;
            const verificationCode = _.trim(vm.data.signupToken);
            const clientPassword = vm.data.clientPassword;
            const residence = vm.data.residence;
            websocketService.sendRequestFor.newAccountVirtual(verificationCode, clientPassword, residence);
        };

        $scope.$on("new_account_virtual", (e, new_account_virtual) => {
            if (!appStateService.isLoggedin) {
                const _token = new_account_virtual.oauth_token;
                websocketService.authenticate(_token);
                vm.showTokenForm = false;
                vm.showSignin = false;
                vm.showSignup = false;
                vm.showvirtualws = false;
            }
        });

        $scope.$on("new_account_virtual:error", (e, error) => {
            $scope.$applyAsync(() => {
                if (error) {
                    if (error.hasOwnProperty("details") && error.details.hasOwnProperty("verification_code")) {
                        vm.tokenError = true;
                        vm.tokenErrorMessage = error.details.verification_code || error.code;
                    }
                    if (error.hasOwnProperty("code") && error.code === "InvalidToken") {
                        vm.tokenError = true;
                        vm.tokenErrorMessage = error.message;
                    }
                    if (error.hasOwnProperty("details") && error.details.hasOwnProperty("client_password")) {
                        vm.passwordError = true;
                        vm.passwordErrorMessage = error.details.client_password || error.code;
                    }
                    if (error.hasOwnProperty("code") && error.code === "PasswordError") {
                        vm.passwordError = true;
                        vm.passwordErrorMessage = error.message;
                    }
                }
            });
        });

        $scope.$on("website_status", (e, website_status) => {
            $scope.$applyAsync(() => {
                if (/gb/.test(website_status.clients_country)) {
                    vm.clientCountryIsUK = true;
                }
            });
        });

        // change different type of singing methods
        vm.changeSigninView = _isBack => {
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
        };

        vm.changeSigninViewtoSignup = () => {
            if (vm.showSignin && !vm.showSignup) {
                vm.showSignup = true;
                vm.showSignin = false;
            }
        };

        vm.showSigninView = () => {
            $scope.$applyAsync(() => {
                vm.showSignin = true;
            });
        };

        $scope.$watch(
            () => appStateService.isLanguageReady,
            (newValue, oldValue) => {
                vm.disableNextbutton = !newValue;
            }
        );

        vm.goToRegulatory = () => {
            window.open(vm.linkToRegulatory, "_blank");
        }

        vm.goToGamStop = () => {
            window.open(vm.gamStopLink, "_blank");
        }
    }
})();
