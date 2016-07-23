angular
	.module('binary')
	.controller('RealityCheckController',
		function($scope, $rootScope, $state, $timeout, $interval, websocketService, appStateService, accountService, $ionicPopup, alertService, localStorageService) {
			var show;
			var myInterval;
			var auth = function() {
				if (!appStateService.isLoggedin) {
					setTimeout(auth, 500);
				} else {
					var _landing_company_name_s;
					var init = function init() {
						accountService.validate();
						$scope.$on('authorize', function(e, authorize) {
							_landing_company_name_s = authorize.landing_company_name;
						});
						var land = function() {
							websocketService.sendRequestFor.landingCompanyDetails(_landing_company_name_s);
							$scope.$on('landing_company_details', function(e, landing_company_details) {
								if (landing_company_details.has_reality_check === 1) {
									if (localStorage._interval) {
										show = 1;
										periodicRequest();
									} else {
										realityCheck();
									}
								}
							});
						}
						$timeout(land, 1000);
					}
					init();
				}
			}
			auth();

			var realityCheck = function() {
				$scope.data = {};
				$scope.data.interval = 60;
				alertService.displayRealitCheckInterval('Reality Check', 'realitycheck getinterval', $scope, 'templates/components/reality-check/interval-popup.template.html', [{
					text: 'Continue trading',
					onTap: function(e) {
						if (!$scope.data.interval) {
							e.preventDefault();
						} else {
							show = 1;
							localStorageService.setInterval($scope.data.interval);
							periodicRequest();
						}
					}
				}, ]);
			};

			var alertRealityCheck = function(reality_check) {
				$scope.data = {};
				$scope.data.interval = parseInt(localStorageService.getInterval('_interval'));
				$scope.realityCheckitems = reality_check;
				$scope.realityCheckitems.date = new Date(reality_check.start_time * 1000);
				$scope.currentTime = new Date().getTime();
				alertService.displayRealityCheckResult('Reality Check',
					'realitycheck', $scope, 'templates/components/reality-check/reality-check-result.template.html', [{
						text: 'Log Out',
						onTap: function() {
							alertService.confirmRemoveAllAccount();
						}
					}, {
						text: 'Continue trading',
						onTap: function() {
							show = 1;
							localStorageService.removeInterval('_interval');
							localStorageService.setInterval($scope.data.interval);
							periodicRequest();
						}
					}, ]
				)
			};
			var sendRealityCheckrequest = function() {
				myInterval = $interval.cancel(myInterval);
				websocketService.sendRequestFor.realityCheck();
				$scope.$on('reality_check', function(e, reality_check) {
					if (show == 1) {
						show = 0;
						alertRealityCheck(reality_check);
					}
				});
			};
			var periodicRequest = function() {
				if (localStorage._interval) {
					var period = localStorageService.getInterval('_interval') * 60000;
					myInterval = $interval(sendRealityCheckrequest, period);
				}
			};
		});
