/**
 * @name alertService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.service('alertService',
		function($translate, $ionicPopup, $rootScope) {
			var displayAlert = function(_title, _message) {
				var alertPopup = $ionicPopup.alert({
					title: _title,
					template: _message
				});
			};

			this.displayError = function(_message) {
				$translate(['alert.error'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], _message);
					});
			};

			this.accountError = {
				tokenNotValid: function() {
					$translate(['alert.error', 'alert.not_valid'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], translation['alert.not_valid']);
					});
				},
				tokenNotAuthenticated: function() {
					$translate(['alert.error', 'alert.not_auth'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], translation['alert.not_auth']);
					});
				},
				tokenNotUnique: function() {
					$translate(['alert.error', 'alert.not_unique'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], translation['alert.not_unique']);
					});
				}
			};

			this.contractError = {
				notAvailable: function() {
					$translate(['alert.error', 'alert.contract_error'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], translation['alert.contract_error']);
					});
				}
			};

			this.optionsError = {
				noTick: function() {
					$translate(['alert.error', 'alert.no_tick'])
					.then(function(translation) {
						displayAlert(translation['alert.error'], translation['alert.no_tick']);
					});
				}
			};

			this.confirmAccountRemoval = function(_token) {
				$translate(['alert.remove_token_title', 'alert.remove_token_content'])
				.then(function(translation) {
					var confirmPopup = $ionicPopup.confirm({
						title: translation['alert.remove_token_title'],
						template: translation['alert.remove_token_content']
					});
					confirmPopup.then(function(res) {
						if(res) {
							console.log('You are sure');
							$rootScope.$broadcast('token:remove', _token);
						}
					});
				});
			}

	});
