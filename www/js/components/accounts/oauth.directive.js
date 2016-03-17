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
    .directive('oauth', function(config, websocketService, alertService){
        return {
            restrict: "E",
            scope: {},
            templateUrl: "templates/components/accounts/oauth.template.html",
            link: function(scope, element, attrs){

                var authenticate = function(_token){
					// Validate the token
					scope.showSpinner = false;
					if(_token && _token.length == 32) {
						scope.showSpinner = true;
                        console.log(_token);
						websocketService.authenticate(_token);
					} else {
						alertService.accountError.tokenNotValid();
					}
                }
               
                window.onmessage = function(_message){
                    console.log(_message);
                    authenticate(_message.data.token);
                }

                scope.signin = function(){
                    var authWindow = window.open("https://www.binary.com/oauth2/authorize?app_id=" + config.app_id,
                            //window.open("http://localhost:8100/#/redirect?token=123123",
                            "_blank",
                            "location=no,toolbar=no");

                    $(authWindow).on('loadstart',
                            function(e){
                                var url = e.originalEvent.url;
                                var token = /token=(.+)&/.exec(url);
                                var expiration = /expires_in=(.+)$/.exec(url);
                                
                                if(token){
                                    authWindow.close();

                                    authenticate(token[1]);
                                }
                            });
                }

            }
        };
    });
