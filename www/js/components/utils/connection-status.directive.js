/**
 * @name connectionError
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/04/2016
 * @copyright Binary Ltd
 */

 angular
 	.module('binary')
 	.directive('connectionStatus',
 		function(){
 			return{
 				scope: {},
 				restrict: 'E',
 				templateUrl: "templates/components/utils/connection-status.template.html",
 				link: function(scope, element, attrs, ngModel){
 					scope.isConnectionError = false;

 					scope.$on("connection:error", function(){
 						scope.isConnectionError = true;

 						if(!scope.$$phase){
 							scope.$apply();
 						}
 					});

 					scope.$on("connection:ready", function(){
 						scope.isConnectionError = false;

 						if(!scope.$$phase){
 							scope.$apply();
 						}
 					});
 				}
 			}
 		});