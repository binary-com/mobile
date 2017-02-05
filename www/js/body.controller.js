angular
	.module('binary')
	.controller('BodyController',
            function($scope, languageService){
							var vm = this;
                vm.getLanguage = function(){
                    return languageService.read();
                };
            });
