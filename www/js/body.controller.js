angular
	.module('binary')
	.controller('BodyController',
    function($scope, languageService, accountService){
			var vm = this;
      vm.getLanguage = function(){
      return languageService.read();
      };
    });
