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
		function($rootScope, $translate, cleanupService) {

			/**
			 * Update default language in local storage
			 * Changes the app language
			 * @param  {String} _language [description]
			 */
			this.update = function(_language) {
				localStorage.language = _language;
                this.set(_language);
			};

			/**
			 * Read the language from local storage
			 * if exists update the app's language
			 */
			this.set = function(_language) {
                if(!_language){
				    var language = localStorage.language || 'en';
                }
                else{
                    var language = _language;
                }
				cleanupService.run();
				$rootScope.$broadcast('language:updated');
				$translate.use(language);

			};

			this.read = function() {
				var language = localStorage['language'];
				return language ? language : 'en';
			};

			this.remove = function(){
				localStorage.removeItem('language');
				cleanupService.run();
			}
	});
