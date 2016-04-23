/**
 * @name OAuth
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/12/2015
 * @copyright Binary Ltd
 * @description directive used to login to the app by Binary OAuth 
 */

angular
    .module('binary')
    .directive('oauth', function(config, websocketService, alertService, accountService){
        return {
            restrict: "E",
            scope: {},
            templateUrl: "templates/components/accounts/oauth.template.html",
            link: function(scope, element, attrs){
                var accounts = [];

                var authenticate = function(_token){
					// Validate the token
					scope.showSpinner = false;
					if(_token && _token.length == 32) {
						scope.showSpinner = true;
						websocketService.authenticate(_token);
					} else {
						alertService.accountError.tokenNotValid();
					}
                }
               
                window.onmessage = function(_message){
                    if(_message.data && _message.data.url){
                        accounts = getAccountsFromUrl(_message.data.url);
                        if(accounts.length > 0){
                            authenticate(accounts[0].token);
                        }
                    }
                }

                scope.$on('authorize', function(e, response){
                   if(response){
                       for(a in accounts){
                           if (a == 0){
                               continue;
                           }

                           accounts[a].email = response.email;
                           accountService.add(accounts[a]);
                       }
                   }
                });

                scope.signin = function(){
                    var authWindow = window.open("https://www.binary.com/oauth2/authorize?app_id=" + config.app_id,
                            //window.open("http://localhost:8100/#/redirect?token=123123",
                            "_blank",
                            "location=no,toolbar=no");

                    $(authWindow).on('loadstart',
                            function(e){
                                var url = e.originalEvent.url;
                                
                                if(getErrorFromUrl(url).length > 0){
                                    authWindow.close();
                                    return;
                                }

                                accounts = getAccountsFromUrl(url);
                                if(accounts && accounts.length){
                                    authWindow.close();

                                    authenticate(accounts[0].token);
                                }
                            });
                }


                function getAccountsFromUrl(_url){
                    var regex = /acct\d+=(\w+)&token\d+=(\w{2}-\w{29})/g;
                    var result = null;
                    var accounts = [];

                    while(result=regex.exec(_url)){
                        accounts.push({
                            loginid: result[1],
                            token: result[2],
                            email: "",
                            is_default: false
                        });
                    }

                    return accounts;
                    
                }

                function getErrorFromUrl(_url){
                    var regex = /error=(\w+)/g;
                    var result = null;
                    var error = [];
                                
                    while(result = regex.exec(_url)){
                        error.push(result[1]);
                    }

                    return error;
                }
            }
        };
    });
