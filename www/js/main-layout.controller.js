angular
	.module('binary')
	.controller('MainLayoutController',
    function($scope, $ionicSideMenuDelegate, accountService){
			var vm = this;
			vm.linkToRegulatory = "https://www.binary.com/" + (localStorage.getItem('language') || "en") + "/regulation.html";
			vm.goToRegulatory = function() {
				window.open(vm.linkToRegulatory, '_blank');
				$ionicSideMenuDelegate.toggleLeft();
			}
    });
