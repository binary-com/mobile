		/**
		 * @name app version controller
		 * @author Nazanin Reihani Haghighi
		 * @contributors []
		 * @since 12/19/2016
		 * @copyright Binary Ltd
		 */

		(function() {
		    'use strict';

		    angular
		        .module('binary.share.components.app-version.controllers')
		        .controller('AppVersionController', AppVersion);

		    AppVersion.$inject = ['$scope', '$ionicPlatform', 'appVersionService'];

		    function AppVersion($scope, $ionicPlatform, appVersionService) {
		        var vm = this;
							$ionicPlatform.ready(function(){
															$scope.$applyAsync(function(){
																	if(window.cordova){
																			cordova.getAppVersion(function(version){
																					vm.appVersion = version;
																			}, function(err){
																					console.log(err);
																			});
																	}
																	else{
																			appVersionService.getAppVersion()
																					.success(function(data){
																							vm.appVersion = data.version;
																					})
																					.error(function(data){
																							vm.appVersion = "0.0.0"
																					});
																	}
															});
									});

		    }
		})();
