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

					scope.$on('authorize', function(e, authorize) {
						if (!appStateService.isCheckedAccountType) {
							appStateService.isCheckedAccountType = true;
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
							websocketService.sendRequestFor.landingCompanySend(scope.countryCode);
						});
						scope.$on('landing_company', function(e, landing_company) {
							scope.accountStates(landing_company);
						});
					};

					// check 3 states combining of Maltainvest shortcode, gaming company and financial company
					scope.accountStates = function(landing_company) {
						scope.data.landingCompany = landing_company;
						if (scope.data.landingCompany.hasOwnProperty('financial_company') && scope.data.landingCompany.hasOwnProperty('gaming_company') == true && scope.data.landingCompany.financial_company.shortcode == "maltainvest") {
							scope.hasFinancialAndGamingAndMaltainvest = true;
							scope.getToken();
						} else if (scope.data.landingCompany.hasOwnProperty('financial_company') && scope.data.landingCompany.hasOwnProperty('gaming_company') == false && scope.data.landingCompany.financial_company.shortcode == "maltainvest") {
							scope.hasFinancialAndMaltainvest = true;
							scope.getToken();
						} else if (!(scope.data.landingCompany.financial_company.shortcode == "maltainvest")) {
							scope.notMaltainvest = true;
							scope.getToken();
						}
					}

					// get tokens from localStorage
					scope.getToken = function() {
						if (localStorage.hasOwnProperty('accounts')) {
							scope.accounts = JSON.parse(localStorage.accounts);
							scope.findTokens();
						}
					}

					// check tokens for account and find which type of virtual and real money account user has already
					scope.findTokens = function() {
						if (scope.hasFinancialAndGamingAndMaltainvest == true) {
							scope.idsFound = [];
							scope.count = scope.accounts.length;
							scope.accounts.forEach(function(el, i) {
								scope.val = scope.accounts[i]['id'];
								if (scope.val.search('MLT') > -1) {
									scope.idsFound.push('MLT');
								} else if (scope.val.search('MF') > -1) {
									scope.idsFound.push('MF');
								} else if (scope.val.search('VRTC') > -1) {
									scope.idsFound.push('VRTC');
								}
								if(!--scope.count){
									scope.financialAndGamingAndMaltainvestStages();
								}
							}
						);
						} else if (scope.hasFinancialAndMaltainvest == true) {
							scope.idsFoundMaltainvest = [];
							scope.count = scope.accounts.length;

							scope.accounts.forEach(function(el, i) {
								scope.val = scope.accounts[i]['id'];
								if (scope.val.search('MF') > -1) {
									scope.idsFoundMaltainvest.push('MF');
								} else if (scope.val.search('VRTC') > -1) {
									scope.idsFoundMaltainvest.push('VRTC');
								}
								if(!--scope.count){
									scope.financialAndMaltainvestStages();

								}
							}

					);
						} else if (scope.notMaltainvest == true) {
							scope.idsFoundNoLicense = [];
							scope.count = scope.accounts.length;
							scope.accounts.forEach(function(el, i) {
								scope.val = scope.accounts[i]['id'];
								if (scope.val.search('VRTC') > -1) {
									scope.idsFoundNoLicense.push('VRTC');
								} else if (scope.val.search('MX') > -1) {
									scope.idsFoundNoLicense.push('MXorCR');
								} else if (scope.val.search('CR') > -1) {
									scope.idsFoundNoLicense.push('MXorCR');
								}
								if(!--scope.count){
									scope.notMaltainvestStages();

								}
							}

						);
						}
					}
					

					scope.financialAndGamingAndMaltainvestStages = function() {
						if (scope.idsFound.indexOf('VRTC') > -1 && scope.idsFound.indexOf('MLT') == -1 && scope.idsFound.indexOf('MF') == -1) {
							// can upgrade to mlt
							// use https://developers.binary.com/api/#new_account_real
							scope.newAccountReal();
						} else if (scope.idsFound.indexOf('VRTC') > -1 && scope.idsFound.indexOf('MLT') > -1 && scope.idsFound.indexOf('MF') == -1) {
							// can upgrade to MF
							// use https://developers.binary.com/api/#new_account_maltainvest
							// flag for readonly inputs of account setting
								appStateService.hasMLT = true;
							scope.newAccountMaltainvest();
						} else if (scope.idsFound.indexOf('VRTC') > -1 && scope.idsFound.indexOf('MLT') > -1 && scope.idsFound.indexOf('MF') > -1) {
							// already has all kind of accounts
							// do nothing
						}
					}

					scope.financialAndMaltainvestStages = function() {
						if (scope.idsFoundMaltainvest.indexOf('VRTC') > -1 && scope.idsFoundMaltainvest.indexOf('MF') == -1) {
							// can upgrade to MF
							// use https://developers.binary.com/api/#new_account_maltainvest
							scope.newAccountMaltainvest();
						} else if (scope.idsFoundMaltainvest.indexOf('VRTC') > -1 && scope.idsFoundMaltainvest.indexOf('MF') > -1) {
							// already has all kind of accounts
							// do nothing
						}
					}

					scope.notMaltainvestStages = function() {
						if (scope.idsFoundNoLicense.indexOf('VRTC') > -1 && scope.idsFoundNoLicense.indexOf('MXorCR') == -1) {
							// can upgrade to MX or CR
							// use https://developers.binary.com/api/#new_account_real
							scope.newAccountReal();
						} else if (scope.idsFoundNoLicense.indexOf('VRTC') > -1 && scope.idsFoundNoLicense.indexOf('MXorCR') > -1) {
							// already has all kind of accounts
							// do nothing
						}
					}

					// functions for showing the upgrade link and show the related forms to the condition
					scope.newAccountReal = function() {
						scope.$applyAsync(function() {
							scope.showUpgradeLink = true;
							$rootScope.isNewAccountReal = true;
						});
					}
					scope.newAccountMaltainvest = function() {
						scope.$applyAsync(function() {
							scope.showUpgradeLinkMaltainvest = true;
							$rootScope.isNewAccountMaltainvest = true;
						});
					}
					scope.$on('logout', function(e) {
						scope.$applyAsync(function() {
							scope.showUpgradeLink = false;
							scope.showUpgradeLinkMaltainvest = false;
							$rootScope.isNewAccountReal = false;
							$rootScope.isNewAccountMaltainvest = false;
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
