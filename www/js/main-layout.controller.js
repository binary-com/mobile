angular
	.module('binary')
	.controller('MainLayoutController',
    function($scope, $ionicSideMenuDelegate, accountService){
			var vm = this;
			vm.updateDefaultAccount = function() {
				vm.selectedAccount = localStorage.defaultAccount;
			}
			
			$scope.$on('authorize', (e, authorize) => {
				localStorage.defaultAccount = accountService.getDefault().id;
				vm.updateDefaultAccount();
			});

			$scope.$watch(function () {
				return $ionicSideMenuDelegate.isOpenLeft();
			},
			function (isOpen) {
				if (!isOpen){
					vm.showAccountSwitch = false;
				}
			});
    });
