/**
 * @name translation.config
 * @author Massih Hazrati
 * @contributors []
 * @since 11/4/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.config(['$translateProvider',
		function($translateProvider) {
            var language = localStorage['language'];
            language ? language : 'en';
			$translateProvider.preferredLanguage(language);
			$translateProvider.useStaticFilesLoader({
				prefix: 'i18n/',
				suffix: '.json'
			});
		}
	]);
