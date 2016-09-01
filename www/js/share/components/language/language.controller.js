/**
 * @name language directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.language.controllers')
    .controller('LanguageController', Language);

  Language.$inject = ['languageService'];

  function Language(languageService){

    var vm = this;

    vm.language = languageService.read();

    vm.changeLanguage = function(){
      languageService.update(vm.language);
    }
  }
})();
