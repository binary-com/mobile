angular
	.module('binary')
	.controller('RealityCheckController',
		function($scope, $rootScope, $state, $timeout, $location, websocketService, appStateService, accountService, $ionicPopup, alertService, $translate, languageService, proposalService, marketService) {
			var landingCompanyName;
			$scope.$on('authorize', function(e, authorize) {
				$scope.sessionLoginId = authorize.loginid;
				// check if user is not already authorized, account is real money account  & is not changed in app
				if (!appStateService.isRealityChecked && authorize.is_virtual == 0 && !appStateService.isChangedAccount) {
					landingCompanyName = authorize.landing_company_name;
					websocketService.sendRequestFor.landingCompanyDetails(landingCompanyName);
				}
				// check if user is already authorized, account changed and is virtual money account
				else if (appStateService.isRealityChecked && appStateService.isChangedAccount && authorize.is_virtual == 1) {
					$timeout.cancel($scope.realityCheckTimeout);
					appStateService.isChangedAccount = false;
					appStateService.isRealityChecked = true;
				}
				// check if account is changed and is real money account
				else if (appStateService.isChangedAccount && authorize.is_virtual == 0) {
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
				var set = sessionStorage.setItem('_interval', val);
			};
			$scope.setStart = function setInterval(val) {
				var set = sessionStorage.setItem('start', val);
			};

			$scope.getInterval = function(key) {
				return sessionStorage.getItem(key);
			};
			$scope.getStart = function(key) {
				return sessionStorage.getItem(key);
			};

			$scope.removeInterval = function(key) {
				var remove = sessionStorage.removeItem(key);
			};
			$scope.removeStart = function(key) {
				var remove = sessionStorage.removeItem(key);
			};

			$scope.hasRealityCheck = function() {
				// if not asked the interval from user and the start time of reality check popups are not set in sessionStorage
				if (!appStateService.isRealityChecked && _.isEmpty(sessionStorage._interval) == true) {
					$scope.realityCheck();
				}
				// if not asked the interval from user and the start time of reality check popups are set in sessionStorage
				// happens when user refresh the browser
				else if (!appStateService.isRealityChecked && sessionStorage.start) {
					appStateService.isRealityChecked = true;
					// calculate the difference between time of last popup and current time
					var timeGap = $scope.getStart('start');
					var thisTime = (new Date()).getTime();
					// if the difference above is smaller than the interval set the period for popup timeout to remained time
					if (($scope.getInterval('_interval') * 60000) - (thisTime - timeGap) > 0) {
						var period = ($scope.getInterval('_interval') * 60000) - (thisTime - timeGap);
						$scope.realityCheckTimeout = $timeout($scope.getRealityCheck, period);
					}
				}
				// if user did not refresh the app and the interval is set
				else {
					if (_.isEmpty(sessionStorage._interval) == false) {
						var period = $scope.getInterval('_interval') * 60000;
						$scope.realityCheckTimeout = $timeout($scope.getRealityCheck, period);
					}
				}
			}


			$scope.realityCheck = function() {
				appStateService.isRealityChecked = true;
				$scope.data = {};
				$scope.data.interval = 60;
				appStateService.isPopupOpen = true;
				$translate(['realitycheck.continue', 'realitycheck.title'])
					.then(function(translation) {
							alertService.displayRealitCheckInterval(
								translation['realitycheck.title'],
								'realitycheck getinterval',
								$scope,
								'templates/components/reality-check/interval-popup.template.html', [{
									text: translation['realitycheck.continue'],
									type: 'button-positive',
									onTap: function(e) {
										if ($scope.data.interval <= 120 && $scope.data.interval >= 10) {
											$scope.setInterval($scope.data.interval);
											$scope.data.start_interval = (new Date()).getTime();
											$scope.setStart($scope.data.start_interval);
											$scope.hasRealityCheck();
											appStateService.isPopupOpen = false;
										} else {
											e.preventDefault();
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
				$scope.realityCheckitems.start_time = $scope.start_time.toUTCString();
				$scope.now = Date.now();
				$scope.realityCheckitems.currentTime = new Date($scope.now).toUTCString();
				$scope.duration = ($scope.now - $scope.date);
				$scope.realityCheckitems.days = Math.floor($scope.duration / 864e5);
				$scope.hour = $scope.duration - ($scope.realityCheckitems.days * 864e5);
				$scope.realityCheckitems.hours = Math.floor($scope.hour / 36e5);
				$scope.min = $scope.duration - (($scope.realityCheckitems.days * 864e5) + ($scope.realityCheckitems.hours * 36e5));
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
							$scope.removeInterval('_interval');
							appStateService.isRealityChecked = false;
							appStateService.isPopupOpen = false;
							sessionStorage.removeItem('start');
							appStateService.isCheckedAccountType = false;
							$state.go('signin');
						}
						if (!res) {
							$scope.hasRealityCheck();
						}
					}
				);
			};

			$scope.alertRealityCheck = function(reality_check) {
				$scope.removeStart('start');
				$scope.realityCheckitems = reality_check;
				if ($scope.sessionLoginId == $scope.realityCheckitems.loginid) {
					$scope.sessionTime(reality_check);
					$scope.data = {};
					$scope.data.interval = parseInt($scope.getInterval('_interval'));
					$timeout.cancel($scope.realityCheckTimeout);
					appStateService.isPopupOpen = true;
					$translate(['realitycheck.title', 'realitycheck.continue', 'realitycheck.logout'])
						.then(
							function(translation) {
								alertService.displayRealityCheckResult(
									translation['realitycheck.title'],
									'realitycheck result-popup',
									$scope,
									'templates/components/reality-check/reality-check-result.template.html', [{
										text: translation['realitycheck.logout'],
										type: 'button-secondary',
										onTap: function() {
											$scope.logout();
										}
									}, {
										text: translation['realitycheck.continue'],
										type: 'button-positive',
										onTap: function(e) {
											if ($scope.data.interval <= 120 && $scope.data.interval >= 10) {
												if ($scope.sessionLoginId == $scope.realityCheckitems.loginid) {
													$scope.getLastInterval($scope.data.interval);
													$scope.data.start_interval = (new Date()).getTime();
													$scope.setStart($scope.data.start_interval);
													$scope.hasRealityCheck();
													appStateService.isPopupOpen = false;
												}
											} else {
												e.preventDefault();
											}
										}
									}, ]
								);
							}
						)
				}

			};
		});
