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
			$translateProvider.preferredLanguage('en');
			$translateProvider.useStaticFilesLoader({
				prefix: 'i18n/',
				suffix: '.json'
			});
		}
	]);
