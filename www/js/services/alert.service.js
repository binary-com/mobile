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
				if(navigator.notification === undefined){
					var alertPopup = $ionicPopup.alert({
						title: _title,
						template: _message
					});
				}
				else{
					navigator.notification.alert(_message, null, _title, 'OK');
				}
			};

			var displayConfirmation = function(_title, _message, _buttons, _callback){
				if(navigator.notification === undefined){
					var confirmPopup = $ionicPopup.confirm({
						title: _title,
						template: _message
					});
					confirmPopup.then(_callback);
				}
				else{
					navigator.notification.confirm(
						_message,
						_callback,
						_title,
						_buttons
					);
				}
			};

			this.displayError = function(_message) {
				$translate(['alert.error'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], _message);
					});
			};

			this.displaySymbolWarning = function(_message, _callback){
				$translate(['alert.warning', _message])
					.then(function(translation){
						displayAlert(translation['alert.warning'], translation[_message]);
					});
			}

			this.accountError = {
				tokenNotValid: function() {
					$translate(['alert.error', 'alert.not_valid'])
					.then(function (translation) {
						displayAlert(translation['alert.error'], translation['alert.not_valid']);
						//navigator.notification.alert(translation['alert.not_valid'], null, translation['alert.error'], 'OK');
					});
				},
				tokenNotAuthenticated: function(message) {
					$translate(['alert.error', 'alert.not_auth'])
					.then(function (translation) {
						displayAlert(message ? message : translation['alert.error'], translation['alert.not_auth']);
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

            this.displayAlert = function(_title, _message){
                displayAlert(_title, _message);
            };

			this.confirmAccountRemoval = function(_token) {
				$translate(['alert.remove_token_title', 'alert.remove_token_content'])
				.then(function(translation) {
					displayConfirmation(translation['alert.remove_token_title'],
						translation['alert.remove_token_content'],
						['Yes', 'No'],
						function(res) {
							if(!(typeof(res) === "boolean")){
								if(res == 1)
									res == true;
								else
									res = false;
							}

							if(res) {
								$rootScope.$broadcast('token:remove', _token);
							}
						}
					);
				});
			};

			this.confirmRemoveAllAccount = function(_callback){
				$translate(['alert.remove_all_tokens_title', 'alert.remove_all_tokens_content'])
					.then(function(translation){
						displayConfirmation(
							translation['alert.remove_all_tokens_title'],
							translation['alert.remove_all_tokens_content'],
							['Yes', 'No'],
							_callback
						);
					});
			}

			this.confirmExit = function(_callback){
				$translate(['app.exit_title', 'app.exit_confirmation'])
					.then(function(translation){
						displayConfirmation(
							translation['app.exit_title'],
							translation['app.exit_confirmation'],
							['Yes', 'No'],
							_callback
						);
					});
			}

	});
