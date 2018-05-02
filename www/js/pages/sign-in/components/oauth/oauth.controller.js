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

        const authenticate = _token => {
            // Validate the token
            if (_token && _token.length === 32) {
                $ionicLoading.show();
                websocketService.authenticate(_token);
            } else {
                alertService.accountError.tokenNotValid();
            }
        };

        const handleUrl = (url) => {
            accounts = getAccountsFromUrl(url);
            if (accounts.length > 0) {
                authenticate(accounts[0].token);
            }
        }

        window.onmessage = function(_message) {
            if (_message.data && _message.data.url) {
                handleUrl(_message.data.url);
            }
        };

        $scope.$on("authorize", (e, response) => {
            if (response) {
                const accountList = response.account_list;
                accounts.forEach((value, index) => {
                    if (index > 0) {
                        let account = accounts[index];
                        account.email = response.email;
                        account.country = response.country;
                        if (accountList) {
                            const acc = _.find(accountList, a => a.loginid === account.loginid);
                            account = _.assign(account, acc);
                        }
                        accountService.add(account);
                    }
                });
            }
            $ionicLoading.hide();
        });


        vm.init = () => {
            if (!_.isEmpty(vm.accountTokens)) {
                handleUrl(vm.accountTokens);
            }
        };

        vm.signin = () => {
            const serverUrl = localStorage.getItem('config.server_url');
            const oauthUrl = serverUrl ? `https://${serverUrl}/oauth2/authorize` : config.oauthUrl;
            const appId = localStorage.getItem('config.app_id') || config.app_id;
            const oauthWindowUrl = `${oauthUrl}?app_id=${appId}&l=${languageService.read()}`;
 
            let windowTarget = '_system';

            if(window.navigator.standalone) {
                windowTarget = '_self';
            }

            const authWindow = window.open(
                oauthWindowUrl,
                windowTarget,
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
                        loginid : result[1],
                        token   : result[2],
                        currency: result[4] ? result[4] : null,
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

        vm.init();
    }
})();
