/**
 * @name alertService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 */

angular.module("binary").service("alertService", function($translate, $ionicPopup, $rootScope) {
    const displayAlert = function(_title, _message, _button, _callback) {
        $translate(["alert.ok"]).then(translation => {
            if (navigator.notification === undefined) {
                const alertPopup = $ionicPopup.alert({
                    title   : _title,
                    template: _message,
                    buttons : [
                        {
                            type: "button-positive",
                            text: _button || translation["alert.ok"]
                        }
                    ]
                });
                alertPopup.then(_callback);
            } else {
                navigator.notification.alert(_message, _callback, _title, _button || translation["alert.ok"]);
            }
        });
    };

    const displayConfirmation = function(_title, _message, _buttons, _callback) {
        if (navigator.notification === undefined) {
            const confirmPopup = $ionicPopup.confirm({
                title   : _title,
                template: _message,
                buttons : _buttons
            });
            confirmPopup.then(_callback);
        } else {
            navigator.notification.confirm(_message, _callback, _title, _buttons);
        }
    };

    this.displayRealitCheckInterval = function(_title, _class, scope, _template, _buttons, _callback) {
        const showPopup = $ionicPopup.show({
            title      : _title,
            cssClass   : _class,
            scope,
            templateUrl: _template,
            buttons    : _buttons
        });
        showPopup.then(_callback);
    };

    this.displayRealityCheckResult = function(_title, _class, scope, _template, _buttons, _callback) {
        const showPopup = $ionicPopup.show({
            title      : _title,
            cssClass   : _class,
            scope,
            templateUrl: _template,
            buttons    : _buttons
        });
        showPopup.then(_callback);
    };

    this.displayIOSPWAPrompt = function(_title, _class, scope, _template, _buttons, _callback) {
        const showPopup = $ionicPopup.show({
            title      : _title,
            cssClass   : _class,
            scope,
            templateUrl: _template,
            buttons    : _buttons,
        });
        showPopup.then(_callback);
        return showPopup;
    }

    this.displayError = function(_message) {
        $translate(["alert.error"]).then(translation => {
            displayAlert(translation["alert.error"], _message);
        });
    };

    this.displaySymbolWarning = function(_message, _callback) {
        $translate(["alert.warning", _message]).then(translation => {
            displayAlert(translation["alert.warning"], translation[_message]);
        });
    };

    this.accountError = {
        tokenNotValid() {
            $translate(["alert.error", "alert.not_valid"]).then(translation => {
                displayAlert(translation["alert.error"], translation["alert.not_valid"]);
                // navigator.notification.alert(translation['alert.not_valid'], null, translation['alert.error'], 'OK');
            });
        },
        tokenNotAuthenticated(message) {
            $translate(["alert.error", "alert.not_auth"]).then(translation => {
                displayAlert(translation["alert.error"], message || translation["alert.not_auth"]);
            });
        },
        tokenNotUnique() {
            $translate(["alert.error", "alert.not_unique"]).then(translation => {
                displayAlert(translation["alert.error"], translation["alert.not_unique"]);
            });
        }
    };

    this.contractError = {
        notAvailable() {
            $translate(["alert.error", "alert.contract_error"]).then(translation => {
                displayAlert(translation["alert.error"], translation["alert.contract_error"]);
            });
        }
    };

    this.optionsError = {
        noTick() {
            $translate(["alert.error", "alert.no_tick"]).then(translation => {
                displayAlert(translation["alert.error"], translation["alert.no_tick"]);
            });
        }
    };

    this.displayAlert = displayAlert;

    this.confirmAccountRemoval = function(_token) {
        $translate(["alert.remove_token_title", "alert.remove_token_content"]).then(translation => {
            displayConfirmation(
                translation["alert.remove_token_title"],
                translation["alert.remove_token_content"],
                ["Yes", "No"],
                res => {
                    if (!(typeof res === "boolean")) {
                        if (res === 1) res = true;
                        else res = false;
                    }

                    if (res) {
                        $rootScope.$broadcast("token:remove", _token);
                    }
                }
            );
        });
    };

    this.confirmRemoveAllAccount = function(_callback) {
        $translate([
            "alert.remove_all_tokens_title",
            "alert.remove_all_tokens_content",
            "alert.yes",
            "alert.no"
        ]).then(translation => {
            let buttons = null;
            if (navigator.notification) {
                buttons = [translation["alert.yes"], translation["alert.no"]];
            } else {
                buttons = [
                    {
                        text : translation["alert.no"],
                        onTap: () => false
                    },
                    {
                        text : translation["alert.yes"],
                        type : "button-positive",
                        onTap: () => true
                    }
                ];
            }
            displayConfirmation(
                translation["alert.remove_all_tokens_title"],
                translation["alert.remove_all_tokens_content"],
                buttons,
                _callback
            );
        });
    };

    this.confirmExit = function(_callback) {
        $translate(["app.exit_title", "app.exit_confirmation", "alert.yes", "alert.no"]).then(translation => {
            displayConfirmation(
                translation["app.exit_title"],
                translation["app.exit_confirmation"],
                [translation["alert.yes"], translation["alert.no"]],
                _callback
            );
        });
    };

    this.showInformation = function (scope, title, templateUrl) {
        const showPopup = $ionicPopup.show({
            title,
            cssClass: 'information-popup',
            scope,
            templateUrl,
            buttons : [
                {
                    type: "button-positive",
                    text: $translate.instant("alert.ok")
                }
            ]
        });
        return showPopup;
    }

    this.showProfessioanlClientInformation = scope => this.showInformation(
        scope,
        $translate.instant('professional-client.professional_client'),
        'js/share/templates/professional-client/professional-client-information.template.html'
    );

    this.showPEPInformation = scope => this.showInformation(
        scope,
        $translate.instant('pep-information.pep'),
        'js/share/templates/pep-information/pep-information.template.html'
    );

    this.showTaxInformation = scope => this.showInformation(
        scope,
        $translate.instant('what-is-tax-information.tax_information_title'),
        'js/share/templates/tax-information/tax-information.template.html'
    );

    this.displayProfessionalClientConfirmation = (_title, _class, scope, _template, _buttons) => {
        const showPopup = $ionicPopup.show({
            title      : _title,
            cssClass   : _class,
            scope,
            templateUrl: _template,
            buttons    : _buttons
        });
        return showPopup;
    };

});
