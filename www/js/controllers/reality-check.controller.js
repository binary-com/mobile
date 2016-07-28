angular
	.module('binary')
	.controller('RealityCheckController',
		function($scope, $rootScope, $state, $timeout, $location, websocketService, appStateService, accountService, $ionicPopup, alertService, $translate, languageService, proposalService, marketService) {
			var landingCompanyName;
			$scope.$on('authorize', function(e, authorize) {
				if (!appStateService.isRealityChecked && authorize.is_virtual == 0) {
					landingCompanyName = authorize.landing_company_name;
					websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
				} else if (appStateService.isRealityChecked && appStateService.isChangedAccount && authorize.is_virtual == 1) {
					$timeout.cancel($scope.realityCheckTimeout);
					appStateService.isChangedAccount = false;
					appStateService.isRealityChecked = true;
				} else if (appStateService.isRealityChecked && appStateService.isChangedAccount && authorize.is_virtual == 0) {
					if ($scope.realityCheckTimeout) {
						$timeout.cancel($scope.realityCheckTimeout);
					}
					appStateService.isRealityChecked = false;
					landingCompanyName = authorize.landing_company_name;
					websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
					appStateService.isChangedAccount = false;
				}
			});
			$scope.$on('landing_company_details', function(e, landingCompanyDetails) {
				if (landingCompanyDetails.has_reality_check === 1) {
					$scope.hasRealityCheck();
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
					var period = $scope.getInterval('_interval') * 600;
					$scope.realityCheckTimeout = $timeout($scope.getRealityCheck, period);

				}
			}

			$scope.realityCheck = function() {
				appStateService.isRealityChecked = true;
				$scope.data = {};
				$scope.data.interval = 60;
				$translate(['realitycheck.continue', 'realitycheck.title'])
					.then(
						function(translation) {
							alertService.displayRealitCheckInterval(
								translation['realitycheck.title'],
								'realitycheck getinterval',
								$scope,
								'templates/components/reality-check/interval-popup.template.html', [{
									text: translation['realitycheck.continue'],
									onTap: function(e) {
										if (!$scope.data.interval) {
											e.preventDefault();
										} else {
											$scope.setInterval($scope.data.interval);
											$scope.hasRealityCheck();
										}
									}
								}, ]);
						}
					)

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
			$scope.sessionTime = function(reality_check) {
								$scope.date = reality_check.start_time * 1000;
								$scope.start_time = new Date($scope.date);
								$scope.realityCheckitems.start_time = $scope.start_time.toString();
								$scope.now = Date.now();
								$scope.realityCheckitems.currentTime = new Date($scope.now).toString();
								$scope.duration = ($scope.now - $scope.date);
								$scope.realityCheckitems.days = Math.floor($scope.duration / 864e5);
								$scope.hour = $scope.duration - ($scope.realityCheckitems.days * 864e5);
								$scope.realityCheckitems.hours = Math.floor($scope.hour / 36e5);
								$scope.min = $scope.duration - ($scope.realityCheckitems.hours * 36e5);
								$scope.realityCheckitems.minutes = Math.floor($scope.min / 60000);
			}

			$scope.logout = function() {
				alertService.confirmRemoveAllAccount(
					function(res) {
						if (typeof(res) !== "boolean") {
							if (res == 1)
								res = true;
							else
								res = false;
						}

						if (res) {
							accountService.removeAll();
							proposalService.remove();
							marketService.removeActiveSymbols();
							marketService.removeAssetIndex();
							appStateService.isLoggedin = false;
							websocketService.closeConnection();
							$scope.$parent.$broadcast('logout');
							$state.go('signin');
						}
						if (!res) {
							$scope.hasRealityCheck();
						}
					}
				);
			};

			$scope.alertRealityCheck = function(reality_check) {
				$scope.realityCheckitems = reality_check;
				$scope.sessionTime(reality_check);
				$scope.data = {};
				$scope.data.interval = parseInt($scope.getInterval('_interval'));

				$translate(['realitycheck.title', 'realitycheck.continue', 'realitycheck.logout'])
					.then(
						function(translation) {
							alertService.displayRealityCheckResult(
								translation['realitycheck.title'],
								'realitycheck',
								$scope,
								'templates/components/reality-check/reality-check-result.template.html', [{
									text: translation['realitycheck.logout'],
									type: 'button-secondary',
									onTap: function() {
										$scope.logout();
									}
								}, {
									text: translation['realitycheck.continue'],
									onTap: function() {
										if (sessionStorage._interval) {
											$scope.getLastInterval();
										} else {
											$scope.data.interval = 60;
										}
										$scope.hasRealityCheck();
									}
								}, ]);
						}
					)

			};
		});
