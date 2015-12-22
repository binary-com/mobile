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
		function($translate, cleanupService) {

			/**
			 * Update default languge in local storage
			 * Changes the app language
			 * @param  {String} _language [description]
			 */
			this.update = function(_language) {
				localStorage.language = _language;
				cleanupService.run();
			};

			/**
			 * Read the language from local storage
			 * if exists update the app's language
			 */
			this.set = function() {
				var language = localStorage.language || 'en';
				cleanupService.run();
				$translate.use(language);

			};

			// TODO: remove
			this.read = function() {
				var language = localStorage['language'];
				return language ? language : 'en';
			};

			this.remove = function(){
				localStorage.removeItem('language');
				cleanupService.run();
			}
	});
