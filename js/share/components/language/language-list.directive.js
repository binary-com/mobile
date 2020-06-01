/**
 * @name language-list directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 10/13/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.share.components.language.directives").directive("bgLanguageList", LanguageList);

    function LanguageList() {
        const directive = {
            restrict    : "E",
            templateUrl : "js/share/components/language/language-list.template.html",
            controller  : "LanguageController",
            controllerAs: "vm",
            scope       : {}
        };

        return directive;
    }
})();
