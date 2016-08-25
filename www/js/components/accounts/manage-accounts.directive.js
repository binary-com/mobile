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
        '$ionicLoading',
		function(accountService, alertService, cleanupService,
                $state, languageService, marketService,
                proposalService, appStateService, $ionicLoading)
        {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/accounts/manage-accounts.template.html',
			link: function(scope, element) {

				var requestId = null;
                scope.accounts = accountService.getAll();

				scope.$on('authorize', function(e, response, reqId) {
                    $ionicLoading.hide();
                    if(response){
					    if(reqId === requestId){
                            if (accountService.isUnique(response.loginid)) {
                                scope.$applyAsync(function(){
                                    accountService.add(response);
                                    accountService.setDefault(response.token);
                                    scope.accounts = accountService.getAll();
                                });
                            } else {
                                if (scope.settingDefault) {
                                    scope.settingDefault = false;
                                } else {
                                    alertService.accountError.tokenNotUnique();
                                }
                            }

                            // reloading language setting
                            //languageService.set();
                        }
                    } else {
                        alertService.accountError.tokenNotAuthenticated(reqId);
                    }

				});

				scope.$on('token:remove', function(e, response) {
                    scope.$applyAsync(function(){
                        accountService.remove(response);
                        scope.accounts = accountService.getAll();
                    });
				});

                var cleanLocalData = function(){
                        // Clearing local data
                        proposalService.remove();
                        marketService.removeActiveSymbols();
                        marketService.removeAssetIndex();
                        appStateService.isLoggedin = false;
                };

				scope.addAccount = function(_token) {
                    $ionicLoading.show();
                    requestId = new Date().getTime();
					scope.showSpinner = false;
					// Validate the token
					if (_token && _token.length === 15) {

                        cleanLocalData();

                        accountService.validate(_token, {req_id: requestId});
												appStateService.isChangedAccount = true;
												sessionStorage.removeItem('start');
												sessionStorage.removeItem('_interval');
												appStateService.isCheckedAccountType = false;
					} else {
                        $ionicLoading.hide();
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
                    $ionicLoading.show();
					accountService.validate(null, {req_id: requestId});
					scope.accounts = accountService.getAll();
					sessionStorage.clear('_interval');
					appStateService.isChangedAccount = true;
					sessionStorage.removeItem('start');
					sessionStorage.removeItem('_interval');
				};
			}
		};
	}]);
