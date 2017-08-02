/**
 * @name language directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function() {
    angular.module("binary.share.components.language.directives").directive("language", Language);

    function Language() {
        const directive = {
            restrict        : "E",
            templateUrl     : "js/share/components/language/language.template.html",
            controller      : "LanguageController",
            controllerAs    : "vm",
            scope           : {},
            bindToController: true
        };

        return directive;
    }
})();
