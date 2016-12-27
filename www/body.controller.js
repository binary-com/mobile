angular
	.module('binary')
	.controller('BodyController',
            function($scope, languageService){
                $scope.getLanguage = function(){
                    return languageService.read();
                };
            });
