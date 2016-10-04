/**
 * @name logout controller
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function (){
  'use strict';

  angular
    .module('binary.share.components.logout.controllers')
    .controller('LogoutController', Logout);

  Logout.$inject = [
		'$rootScope', '$state', 'accountService', 'appStateService', 'websocketService', 'alertService'];

  function Logout(
			$rootScope,
			$state,
      accountService,
      appStateService,
      websocketService,
      alertService
    ){
    var vm = this;
		vm.logout = function(res) {
				alertService.confirmRemoveAllAccount(
					function(res){
						if(typeof(res) !== "boolean"){
							if(res == 1)
								res = true;
							else
								res = false;
						}

						if(res){
							appStateService.isRealityChecked = false;
							appStateService.isChangedAccount = false;
							appStateService.isPopupOpen = false;
							appStateService.isCheckedAccountType = false;
							accountService.removeAll();
														appStateService.isLoggedin = false;
														sessionStorage.removeItem('start');
														sessionStorage.removeItem('_interval');
														websocketService.closeConnection();
                            appStateService.profitTableRefresh = true;
                            appStateService.statementRefresh = true;
                            appStateService.isNewAccountReal = false;
                            appStateService.isNewAccountMaltainvest = false;
                            appStateService.hasMLT = false;
                            sessionStorage.removeItem('countryParams');
							$state.go('signin');
						}
					}
				);
			};
	}
})();
