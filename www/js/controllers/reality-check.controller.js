angular
	.module('binary')
	.controller('RealityCheckController',
		function($scope, $rootScope, $state, $timeout, $interval, websocketService, appStateService, accountService, $ionicPopup, alertService, localStorageService) {
			var showPopup,
				popupInterval,
				landingCompanyName,
				isAuthorized = 0;

			$rootScope.initRealityCheck = function() {
				$scope.$on('authorize', function(e, authorize) {
					if (isAuthorized == 0) {
						isAuthorized = 1;
						landingCompanyName = authorize.landing_company_name;
						$scope.hasRealityCheck();
					}
				});
			};

			$scope.setInterval = function setInterval(val){
			var _interval;
			var set =	sessionStorage.setItem('_interval', val);
			};
			$scope.getInterval = function(key){
				return sessionStorage.getItem(key);
			};
			$scope.removeInterval = function(key){
			var remove = sessionStorage.removeItem(key);
			};


			$scope.hasRealityCheck = function() {
				if (sessionStorage._interval) {
					showPopup = 1;
					$scope.getRealityCheck();
				} else {
					websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
					$scope.$on('landing_company_details', function(e, landingCompanyDetails) {
						if (landingCompanyDetails.has_reality_check === 1) {
							$scope.realityCheck();
						}
					});
				}
			};

			$scope.createInterval = function() {
				if (!$scope.data.interval) {
					e.preventDefault();
				} else {
					$scope.setInterval($scope.data.interval);
					$scope.periodicRequest();
					showPopup = 1;
				}
			}

			$scope.realityCheck = function() {
				$scope.data = {};
				$scope.data.interval = 60;
				alertService.displayRealitCheckInterval(
					'Reality Check',
					'realitycheck getinterval',
					$scope,
					'templates/components/reality-check/interval-popup.template.html', [{
						text: 'Continue trading',
						onTap: function(e) {
							$scope.createInterval();
						}
					}, ]);
			};

			$scope.getLastInterval = function() {
				showPopup = 1;
				$scope.removeInterval('_interval');
				$scope.setInterval($scope.data.interval);
			};

			$scope.periodicRequest = function() {
				if (sessionStorage._interval) {
					var period = $scope.getInterval('_interval') * 600;
					popupInterval = $interval($scope.sendRealityCheckrequest, period);
				}
			};

			$scope.getRealityCheck = function() {
				websocketService.sendRequestFor.realityCheck();
				$scope.$on('reality_check', function(e, reality_check) {
					if (showPopup == 1) {
						showPopup = 0;
						$scope.alertRealityCheck(reality_check);
					}
				});
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
							$scope.periodicRequest();
						}
					}, ]);
			};

			$scope.sendRealityCheckrequest = function() {
				popupInterval = $interval.cancel(popupInterval);
				if (showPopup == 1) {
					$scope.getRealityCheck();
				};
			};

		});
