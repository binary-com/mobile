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
                        scope.$applyAsync(function(){
 						    scope.isConnectionError = true;
                        });
 					});

 					scope.$on("connection:ready", function(){
                        scope.$applyAsync(function(){
     						scope.isConnectionError = false;
                        });

 					});
 				}
 			}
 		});
