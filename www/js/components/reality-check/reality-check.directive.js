angular
	.module('binary')
	.directive('realityCheck', [
		'accountService',
		'languageService',
		'websocketService',
		'$state',
		'$ionicPopup',
		'$compile',
		'$ionicLoading',
		function(
			accountService,
			languageService,
			websocketService,
			$state,
			$ionicPopup,
			$compile,
			$ionicLoading
		) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/reality-check/reality-check.template.html',
				scope: {
					message: "="
				},
				controller: 'RealityCheckController',
				controllerAs: 'reality',
				bindToController: true
			}
		}
	]);
