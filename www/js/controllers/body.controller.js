/**
 * @name HomeController
 * @author Massih Hazrati
 * @contributors []
 * @since 11/16/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.controller('BodyController',
            function($scope, languageService){
                $scope.getLanguage = function(){
                    return languageService.read();
                };
            });
