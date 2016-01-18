/**
 * @name websocketService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/14/2016
 * @copyright Binary Ltd
 * Directive to show application version
 */

angular
	.module('binary')
	.directive('appVersion', function($ionicPlatform){
		return{
			scope: {},
			restrict: 'E',
			templateUrl: 'templates/components/utils/app-version.template.html',
			link: function(scope){
				$ionicPlatform.ready(function(){
					if(cordova){
						cordova.getAppVersion(function(version){
							scope.appVersion = version;
						}, function(err){
							console.log(err);
						});
					}
				});
			}
		}
	});
