/**
 * @name languageService
 * @author Massih Hazrati
 * @contributors []
 * @since 10/26/2015
 * @copyright Binary Ltd
 *
 */

angular.module("binary").service("languageService", function($rootScope, $translate, cleanupService) {
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
        let language = localStorage.language || "en";

        if (_language) {
            language = _language;
        }
        cleanupService.run();
        $rootScope.$broadcast("language:updated");
        $translate.use(language);
    };

    this.read = function() {
        const language = localStorage.language;
        return language || "en";
    };

    this.remove = function() {
        localStorage.removeItem("language");
        cleanupService.run();
    };

    const languageConfigs = {
        en: {
            nativeName: 'English'
        },
        de: {
            nativeName: 'Deutsch'
        },
        es: {
            nativeName: 'Español'
        },
        fr: {
            nativeName: 'Français'
        },
        id: {
            nativeName: 'Indonesia'
        },
        it: {
            nativeName: 'Italiano'
        },
        ja: {
            nativeName: '日本語'
        },
        pl: {
            nativeName: 'Polish'
        },
        pt: {
            nativeName: 'Português'
        },
        ru: {
            nativeName: 'Русский'
        },
        th: {
            nativeName: 'Thai'
        },
        vi: {
            nativeName: 'Tiếng Việt'
        },
        zh_cn: {
            nativeName: '简体中文'
        },
        zh_tw: {
            nativeName: '繁體中文'
        }
    };

    const getLanguageNativeName = function(key) {
        const lang = languageConfigs[key];
        return lang ? lang.nativeName : undefined;
    };
    this.getLanguageNativeName = getLanguageNativeName;
});
