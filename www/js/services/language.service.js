/**
 * @name languageService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 *
 */

angular
	.module('binary')
	.service('languageService',
		function($translate) {

			/**
			 * Update default languge in local storage
			 * Changes the app language
			 * @param  {String} _language [description]
			 */
			this.update = function(_language) {
				localStorage['language'] = _language;
			};

			/**
			 * Read the language from local storage
			 * if exists update the app's language
			 */
			this.load = function() {
				var language = localStorage['language'];
				if (language) {
					$translate.use(language);
				}
			}

			this.read = function() {
				var language = localStorage['language'];
				return language ? language : 'en';
			}
	});
