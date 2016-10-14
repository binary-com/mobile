/**
 * @name language-list directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 10/13/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.language.directives')
    .directive('bgLanguageList', LanguageList);

  function LanguageList(){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/share/components/language/language-list.template.html',
      controller: 'LanguageController',
      controllerAs: 'vm',
      scope: {}
    };

    return directive;
  }
})();
