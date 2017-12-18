/**
 * @name Oauth Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/13/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.signin.components.oauth").controller("OauthController", Oauth);

    Oauth.$inject = [
        "$scope",
        "$ionicLoading",
        "config",
        "websocketService",
        "alertService",
        "accountService",
        "languageService"
    ];

    function Oauth($scope, $ionicLoading, config, websocketService, alertService, accountService, languageService) {
        const vm = this;

        let accounts = [];

        const authenticate = function(_token) {
            // Validate the token
            if (_token && _token.length === 32) {
                $ionicLoading.show();
                websocketService.authenticate(_token);
            } else {
                alertService.accountError.tokenNotValid();
            }
        };

        window.onmessage = function(_message) {
            if (_message.data && _message.data.url) {
                accounts = getAccountsFromUrl(_message.data.url);
                if (accounts.length > 0) {
                    authenticate(accounts[0].token);
                }
            }
        };

        $scope.$on("authorize", (e, response) => {
            if (response) {
                const accountList = response.account_list;
                accounts.forEach((value, index) => {
                    let account = accounts[index];
                    account.email = response.email;
                    account.country = response.country;
                    if (accountList) {
                        const acc = accountList.find(a => a.loginid === account.loginid);
                        account = Object.assign(account, acc);
                    }
                    accountService.add(account);
                });
            }
            $ionicLoading.hide();
        });

        vm.signin = function() {
            const authWindow = window.open(
                `${config.oauthUrl}?app_id=${config.app_id}&l=${languageService.read()}`,
                "_blank",
                "location=no,toolbar=no"
            );

            $(authWindow).on("loadstart", e => {
                const url = e.originalEvent.url;

                if (getErrorFromUrl(url).length > 0) {
                    authWindow.close();
                    return;
                }

                accounts = getAccountsFromUrl(url);
                if (accounts && accounts.length) {
                    authWindow.close();

                    authenticate(accounts[0].token);
                }
            });
        };

        function getAccountsFromUrl(_url) {
            const regex = /acct\d+=(\w+)&token\d+=(\w{2}-\w{29})(&cur\d+=(\w{2,3}))?/g;
            let result = null;
            const accounts = [];

            do {
                result = regex.exec(_url);
                if(result){
                    accounts.push({
                        loginid   : result[1],
                        token     : result[2],
                    });
                }
            } while (result)

            return accounts;
        }

        function getErrorFromUrl(_url) {
            const regex = /error=(\w+)/g;
            let result = null;
            const error = [];

            do {
                result = regex.exec(_url);
                if (result) {
                    error.push(result[1]);
                }
            } while (result)

            return error;
        }
    }
})();
