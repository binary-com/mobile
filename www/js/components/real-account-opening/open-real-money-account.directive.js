angular
	.module('binary')
	.directive('openRealMoneyAccount', [
		'accountService',
		'languageService',
		'websocketService',
		'localStorageService',
		'alertService',
		'$state',
		'$compile',
		'$ionicLoading',
		'appStateService',
		'$rootScope',

		function(accountService,
			languageService,
			websocketService,
			alertService,
			localStorageService,
			$state,
			$compile,
			$ionicLoading,
			appStateService,
			$rootScope) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/real-account-opening/open-real-money-account.template.html',
				scope: {
					message: "="
				},
				link: function(scope, element) {
					scope.showUpgradeLink = false;
					scope.showUpgradeLinkMaltainvest = false;
					scope.isCheckedCompany = false;
					appStateService.hasMLT = false;
					scope.isVirtual = false;
					scope.hasGamingAndVirtual == false;
					scope.hasGamingNotVirtual == false;
					scope.hasFinancialAndMaltainvest == false;
					scope.idsFound = [];

					scope.$on('authorize', function(e, authorize) {
						if (!appStateService.isCheckedAccountType) {
							scope.idsFound = [];
							appStateService.isCheckedAccountType = true;
							if (authorize.is_virtual == 1) {
								scope.isVirtual = true;
							} else {
								scope.isVirtual = false;
							}
							scope.getCompany();
						}
					});

					// get account-setting and landing-company
					scope.getCompany = function() {
						scope.data = {};
						websocketService.sendRequestFor.accountSetting();
						scope.$on('get_settings', function(e, get_settings) {
							scope.data.setting = get_settings;
							scope.countryCode = scope.data.setting.country_code;
							$rootScope.countryCodeOfAccount = scope.data.setting.country_code;
							$rootScope.countryOfAccount = scope.data.setting.country;
							if (scope.countryCode != "JP") {
								websocketService.sendRequestFor.landingCompanySend(scope.countryCode);
							}
						});
						scope.$on('landing_company', function(e, landing_company) {
							if (!scope.isCheckedCompany) {
								scope.isCheckedCompany = true;
								scope.accountStates(landing_company);
							}

						});
					};

					// check 3 states combining of Maltainvest shortcode, gaming company and financial company
					scope.accountStates = function(landing_company) {
						scope.data.landingCompany = landing_company;
						if (scope.data.landingCompany.hasOwnProperty('gaming_company')) {
							if (scope.isVirtual) {
								scope.hasGamingAndVirtual = true;
								scope.getToken();
							} else {
								if (scope.data.landingCompany.hasOwnProperty('financial_company') && (scope.data.landingCompany.gaming_company.shortcode == "maltainvest")) {
									scope.hasGamingNotVirtual = true;
									scope.getToken();
								}
							}
						} else if (!scope.data.landingCompany.hasOwnProperty('gaming_company')) {
							if (scope.isVirtual) {
								if (scope.data.landingCompany.hasOwnProperty('financial_company') && (scope.data.landingCompany.gaming_company.shortcode == "maltainvest")) {
									scope.hasFinancialAndMaltainvest = true;
									scope.getToken();
								}
							}

						}

					}

					// get tokens from localStorage
					scope.getToken = function() {
						if (localStorage.hasOwnProperty('accounts')) {
							scope.accounts = JSON.parse(localStorage.accounts);
							scope.findTokens();

						}
					}

					scope.findTokens = function() {
						if (scope.hasGamingAndVirtual == true) {
							scope.idsFound = [];
							scope.count = scope.accounts.length;
							scope.accounts.forEach(function(el, i) {
									scope.val = scope.accounts[i]['id'];
									if (scope.val.search('VRTC') > -1) {
										scope.idsFound.push('VRTC');
									} else if (scope.val.search('MX') > -1) {
										scope.idsFound.push('MXorCRorMLT');
									} else if (scope.val.search('CR') > -1) {
										scope.idsFound.push('MXorCRorMLT');
									} else if (scope.val.search('MLT') > -1) {
										scope.idsFound.push('MXorCRorMLT');
									}

									if (!--scope.count) {
										scope.gamingAndVirtualStages();
									}
								}

							);
						} else if (scope.hasGamingNotVirtual == true) {
							scope.idsFound = [];
							scope.count = scope.accounts.length;
							scope.accounts.forEach(function(el, i) {
								scope.val = scope.accounts[i]['id'];
								if (scope.val.search('MF') > -1) {
									scope.idsFound.push('MF');
								}

								if (!--scope.count) {
									scope.gamingAndFinancialAndMaltainvestStages();
								}
							});
						} else if (scope.hasFinancialAndMaltainvest == true) {
							scope.idsFound = [];
							scope.count = scope.accounts.length;
							scope.accounts.forEach(function(el, i) {
								scope.val = scope.accounts[i]['id'];
								if (scope.val.search('MF') > -1) {
									scope.idsFound.push('MF');
								}

								if (!--scope.count) {
									scope.financialAndMaltainvestStages();
								}
							});
						}
					}

					scope.gamingAndVirtualStages = function() {
						if (scope.idsFound.indexOf('VRTC') > -1 && scope.idsFound.indexOf('MXorCRorMLT') == -1) {
							// can upgrade to MX or CR
							// use https://developers.binary.com/api/#new_account_real
							scope.newAccountReal();
						}
					}

					scope.gamingAndFinancialAndMaltainvestStages = function() {
						if (scope.idsFound.indexOf('MF') == -1) {
							appStateService.hasMLT = true;
							scope.newAccountMaltainvest();
						}
					}
					scope.financialAndMaltainvestStages = function() {
							if (scope.idsFound.indexOf('MF') == -1) {
								scope.newAccountMaltainvest();
							}
						}
						// functions for showing the upgrade link and show the related forms to the condition
					scope.newAccountReal = function() {
						scope.$applyAsync(function() {
							if (appStateService.isCheckedAccountType) {
								scope.showUpgradeLink = true;
								$rootScope.isNewAccountReal = true;
							}
						});
					}
					scope.newAccountMaltainvest = function() {
						scope.$applyAsync(function() {
							if (appStateService.isCheckedAccountType) {
								scope.showUpgradeLinkMaltainvest = true;
								$rootScope.isNewAccountMaltainvest = true;
							}
						});
					}
					scope.$on('logout', function(e) {
						scope.$applyAsync(function() {
							scope.showUpgradeLink = false;
							scope.showUpgradeLinkMaltainvest = false;
							$rootScope.isNewAccountReal = false;
							$rootScope.isNewAccountMaltainvest = false;
							appStateService.isCheckedAccountType = false;
							scope.hasGamingAndMaltainvest = false;
							scope.hasFinancialAndMaltainvest = false;
							scope.notMaltainvest = false;
							scope.hasGamingAndFinancialAndMaltainvest = false;
							scope.isCheckedCompany = false;
							appStateService.hasMLT = false;

						});
					});

					// link to forms page
					scope.navigateToUpgrade = function() {
						$state.go('realaccountopening');
					}

				}
			};
		}
	]);
