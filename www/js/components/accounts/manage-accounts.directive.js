/**
 * @name changeAccount
 * @author Massih Hazrati
 * @contributors []
 * @since 11/07/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('manageAccounts',[
		'accountService',
		'alertService',
		'cleanupService',
		'$state',
        'languageService',
        'marketService',
        'proposalService',
        'appStateService',
		function(accountService, alertService, cleanupService, 
            $state, languageService, marketService, proposalService, appStateService) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/accounts/manage-accounts.template.html',
			link: function(scope, element) {

				var requestId = null;
                scope.accounts = accountService.getAll();

				scope.$on('authorize', function(e, response, reqId) {
					// TODO: Add spinner
					scope.showSpinner = false;
					if(reqId === requestId){
                        if (response) {
                            if (accountService.isUnique(response.loginid)) {
                                accountService.add(response);
                                accountService.setDefault(response.token);
                                scope.accounts = accountService.getAll();
                                if(!scope.$$phase){
                                    scope.$apply();
                                }
                            } else {
                                if (scope.settingDefault) {
                                    scope.settingDefault = false;
                                } else {
                                    alertService.accountError.tokenNotUnique();
                                }
                            }
                            
                            // reloading language setting
                            languageService.set();

                        } else {
                            alertService.accountError.tokenNotAuthenticated();
                        }
                    }
				});

				scope.$on('token:remove', function(e, response) {
					accountService.remove(response);
					scope.accounts = accountService.getAll();
					if(!scope.$$phase){
						scope.$apply();
					}
				});

                var cleanLocalData = function(){
                        // Clearing local data
                        proposalService.remove();
                        marketService.removeActiveSymbols();
                        marketService.removeAssetIndex();
                        appStateService.isLoggedin = false;
                };

				scope.addAccount = function(_token) {
                    requestId = new Date().getTime();
					scope.showSpinner = false;
					// Validate the token
					if (_token && _token.length === 15) {
						scope.showSpinner = true;
                        
                        cleanLocalData(); 
                        
                        accountService.validate(_token, {req_id: requestId});
					} else {
						alertService.accountError.tokenNotValid();
					}
				};

				scope.removeAccount = function(_token) {
					alertService.confirmAccountRemoval(_token);
				};

				scope.setAccountAsDefault = function(_token) {
                    requestId = new Date().getTime();
					scope.settingDefault = true;

                    cleanLocalData();                    

					accountService.setDefault(_token);
					accountService.validate(null, {req_id: requestId});
					scope.accounts = accountService.getAll();
				};
			}
		};
	}]);
