/**
 * @name scopeMessage
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/01/2016
 * @copyright Binary Ltd
 */

 angular
 	.module('binary')
 	.directive('scopeMessage',
 		function(accountService, appStateService){
            return{
                restrict: "E",
                scope: {},
                templateUrl: "templates/components/accounts/scope-message.template.html",
                link: function(scope, elment, attrs){
                    scope.showScopeMessage = false;
                    scope.hasTradePermissiond = function(){
                        if(appStateService.isLoggedIn){
                            return accountService.checkScope(['READ', 'TRADE']);
                        }
                        else{
                            return true;
                        }
                    };

                    scope.$on('authorize', function(e, _athurize){
                        if(!_athurize){
                            return;
                        }

                        if(!scope.$$phase){
                            scope.showScopeMessage = !accountService.checkScope(['READ', 'TRADE']);
                        }
                    });

                    scope.$on('logout', function(e){
                        scope.showScopeMessage = false;
                    });
                }
            };
        });
