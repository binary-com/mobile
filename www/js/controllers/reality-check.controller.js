angular
	.module('binary')
	.controller('RealityCheckController',
		function($scope, $rootScope, $state, $timeout, websocketService, appStateService, accountService, $ionicPopup, alertService) {
			var popupInterval,
				landingCompanyName;

			$scope.$on('authorize', function(e, authorize) {
				if (!appStateService.isRealityChecked) {
					landingCompanyName = authorize.landing_company_name;
					websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
					$scope.$on('landing_company_details', function(e, landingCompanyDetails) {
						if (landingCompanyDetails.has_reality_check === 1) {
							$scope.hasRealityCheck();
						}
					});
				}
			});

			$scope.setInterval = function setInterval(val) {
				var _interval;
				var set = sessionStorage.setItem('_interval', val);
			};

			$scope.getInterval = function(key) {
				return sessionStorage.getItem(key);
			};

			$scope.removeInterval = function(key) {
				var remove = sessionStorage.removeItem(key);
			};

			$scope.hasRealityCheck = function() {
				if (!appStateService.isRealityChecked) {
					$scope.realityCheck();
				} else {
					var period = $scope.getInterval('_interval') * 60000;
					$timeout($scope.getRealityCheck, period);
				}
			}

			$scope.realityCheck = function() {
				appStateService.isRealityChecked = true;
				$scope.data = {};
				$scope.data.interval = 60;
				alertService.displayRealitCheckInterval(
					'Reality Check',
					'realitycheck getinterval',
					$scope,
					'templates/components/reality-check/interval-popup.template.html', [{
						text: 'Continue trading',
						onTap: function(e) {
							if (!$scope.data.interval) {
								e.preventDefault();
							} else {
								$scope.setInterval($scope.data.interval);
								$scope.hasRealityCheck();
							}
						}
					}, ]);
			};

			$scope.getLastInterval = function() {
				$scope.removeInterval('_interval');
				$scope.setInterval($scope.data.interval);
			};

			$scope.$on('reality_check', function(e, reality_check) {
				$scope.alertRealityCheck(reality_check);
			});

			$scope.getRealityCheck = function() {
				websocketService.sendRequestFor.realityCheck();
			}

			$scope.alertRealityCheck = function(reality_check) {
				$scope.data = {};
				$scope.data.interval = parseInt($scope.getInterval('_interval'));
				$scope.realityCheckitems = reality_check;
				$scope.realityCheckitems.date = new Date(reality_check.start_time * 1000);
				$scope.currentTime = new Date().getTime();

				alertService.displayRealityCheckResult(
					'Reality Check',
					'realitycheck',
					$scope,
					'templates/components/reality-check/reality-check-result.template.html', [{
						text: 'Log Out',
						onTap: function() {
							alertService.confirmRemoveAllAccount();
						}
					}, {
						text: 'Continue trading',
						onTap: function() {
							if (sessionStorage._interval) {
								$scope.getLastInterval();
							} else {
								$scope.data.interval = 60;
							}
							$scope.hasRealityCheck();
						}
					}, ]);
			};
		});
