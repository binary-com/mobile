angular
	.module('binary')
	.directive('newAccountReal', [
		'accountService',
		'languageService',
		'websocketService',
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
			$state,
			$compile,
			$ionicLoading,
			appStateService, $rootScope) {
			return {
				restrict: 'E',
				templateUrl: 'templates/components/real-account-opening/new-account-real.template.html',
				scope: {
					message: "="
				},
				link: function(scope, element) {
					scope.isFirstSection = true;
					scope.isSecondSection = false;
					scope.isThirdSection = false;
					scope.hasMoreStages = true;
					scope.hasLessStages = false;

					// handle the 'next' button
					scope.goToNextSection = function() {
						scope.$applyAsync(function() {
							if (scope.isFirstSection == true && scope.isSecondSection == false && scope.isThirdSection == false) {
								scope.isFirstSection = false;
								scope.isSecondSection = true;
								scope.isThirdSection = false;
								scope.hasLessStages = true;
							} else if (scope.isFirstSection == false && scope.isSecondSection == true && scope.isThirdSection == false) {
								scope.isSecondSection = false;
								scope.isThirdSection = true;
								scope.hasLessStages = true;
								scope.hasMoreStages = false;
							}
						});
					}
						scope.goToLastSection = function(){
							scope.$applyAsync(function() {
							if (scope.isFirstSection == false && scope.isSecondSection == true && scope.isThirdSection == false) {
									scope.isSecondSection = false;
									scope.isFirstSection = true;
									scope.hasLessStages = false;
									scope.hasMoreStages = true;
								} else if (scope.isFirstSection == false && scope.isSecondSection == false && scope.isThirdSection == true) {
									scope.isThirdSection = false;
									scope.isSecondSection = true;
									scope.hasLessStages = true;
									scope.hasMoreStages = true;
								}
							});
						}

					scope.data = {};
					scope.data.countryCode = $rootScope.countryCodeOfAccount;
					scope.data.country = $rootScope.countryOfAccount;
					websocketService.sendRequestFor.statesListSend($rootScope.countryCodeOfAccount);
					scope.$on('states_list', function(e, states_list) {
						scope.statesList = states_list;
					});

					scope.submitAccountOpening = function() {
						if(scope.data.dateOfBirth){
							var birth = scope.data.dateOfBirth.toISOString().slice(0,10);
						}
						websocketService.sendRequestFor.createRealAccountSend(scope.data.salutation, scope.data.firstName, scope.data.lastName, birth, scope.data.countryCode, scope.data.addressLine1, scope.data.addressLine2, scope.data.addressCity, scope.data.state, scope.data.addressPostcode, scope.data.phone, scope.data.secretQuestion, scope.data.secretAnswer);
					};

				}
			}
		}
	]);
