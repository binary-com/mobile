/**
 * @name languageList Directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 04/10/2016
 * @copyright Binary Ltd
 */

angular
    .module('binary')
    .directive('languageList', function(languageService){
        return {
            restrict: 'E',
            scope: {},
            templateUrl: 'templates/components/language/language-list.template.html',
            link: function(scope, element, attrs, ngModel){
                scope.language = languageService.read();

                scope.changeLanguage = function(){
                    languageService.update(scope.language);
                }
            }
        };
    });
