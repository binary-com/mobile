/**
 * @name accounts controller
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/15/2016
 * @copyright Binary Ltd
 */

(function (){
  'use strict';

  angular
    .module('binary.share.components.accounts.controllers')
    .controller('AccountsController', Accounts);

  Accounts.$inject = [
    'accountService', 'appStateService',
    'utilsService', 'websocketService', 'alertService'];

  function Accounts(
      accountService,
      appStateService,
      utilsService,
      websocketService
    ){
    var vm = this;

    var init = function() {
      vm.accounts = accountService.getAll();
      vm.selectedAccount = accountService.getDefault().token;
    };

    var updateSymbols = function(){
      // Wait untile the login progress is finished
      if(!appStateService.isLoggedin){
        setTimeout(updateSymbols, 500);
      }
      else{
        websocketService.sendRequestFor.symbols();
        websocketService.sendRequestFor.assetIndex();
      }
    };

    init();

    vm.updateAccount = function(_selectedAccount) {
      appStateService.isChangedAccount = true;
			appStateService.isCheckedAccountType = false;
			sessionStorage.removeItem('start');
			sessionStorage.removeItem('_interval');
      utilsService.spinnerLogo.start();
      accountService.setDefault(_selectedAccount);
      accountService.validate();
      updateSymbols();
      $root.$broadcast('changedAccount');

    };


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
							// proposalService.remove();
                            // marketService.removeActiveSymbols();
                            // marketService.removeAssetIndex();
                            appStateService.isLoggedin = false;
														sessionStorage.removeItem('start');
														sessionStorage.removeItem('_interval');
                            localStorage.removeItem('profitTableState');
                            localStorage.removeItem('statementState');
                            websocketService.closeConnection();
                            appStateService.hasMLT = false;
                            $scope.$parent.$broadcast('logout');
							$state.go('signin');
						}
					}
				);
			};



  }
})();
