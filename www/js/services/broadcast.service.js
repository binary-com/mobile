/**
 * @name SignInController
 * @author Massih Hazrati
 * @contributors []
 * @since 10/12/2015
 * @copyright Binary Ltd
 * Handles sign-in functionalities
 */

angular
	.module('binary')
	.service('broadcastService',
		function($rootScope) {
			return {
				broadcast: function(message, data) {
					$rootScope.$broadcast(message,data);
				}
			};
	});
