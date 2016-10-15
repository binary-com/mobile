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

    vm.ios = ionic.Platform.isIOS();
    vm.android = ionic.Platform.isAndroid();

    vm.languages = [
      { id: 'id', title: 'Bahasa Indonesia'},
      { id: 'de', title: 'Deutsch'},
      { id: 'en', title: 'English'},
      { id: 'es', title: 'Español'},
      { id: 'it', title: 'Italiano'},
      { id: 'pl', title: 'Polish'},
      { id: 'pt', title: 'Português'},
      { id: 'th', title: 'ไทย'},
      { id: 'zh_cn', title: '简体中文'},
      { id: 'zh_tw', title: '繁體中文'},
      { id: 'ru', title: 'Русский'},
      { id: 'vi', title: 'Vietnamese'}
    ];

    vm.language = languageService.read();

    vm.changeLanguage = function(language){
      vm.language = language || vm.language;
      languageService.update(vm.language);
    }
  }
})();
