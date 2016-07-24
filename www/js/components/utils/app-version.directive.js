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
	.directive('appVersion', function($ionicPlatform, appVersionService){
		return{
			scope: {
                class: "@"
            },
			restrict: 'E',
			templateUrl: 'templates/components/utils/app-version.template.html',
			link: function(scope){
				$ionicPlatform.ready(function(){
                    scope.$applyAsync(function(){
                        if(window.cordova){
                            cordova.getAppVersion(function(version){
                                scope.appVersion = version;
                            }, function(err){
                                console.log(err);
                            });
                        }
                        else{
                            appVersionService.getAppVersion()
                                .success(function(data){
                                    scope.appVersion = data.version;
                                })
                                .error(function(data){
                                    scope.appVersion = "0.0.0"
                                });
                        }
                    });
				});
			}
		}
	});
