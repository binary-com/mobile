/**
 * @name translation.config
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/7/2016
 * @copyright Binary Ltd
 */

angular.module("binary").config([
    "$translateProvider",
    function($translateProvider) {
        const language = localStorage.language || "en";
        $translateProvider.fallbackLanguage("en");
        $translateProvider.preferredLanguage(language);
        $translateProvider.useStaticFilesLoader({
            prefix: "i18n/",
            suffix: ".json"
        });
    }
]);
