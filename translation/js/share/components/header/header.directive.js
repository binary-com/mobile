/**
 * @name header directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/07/2016
 * @copyright Binary Ltd
 * Application Header
 */

(function(){
  'use strict';
  angular
    .module('binary.share.components')
    .directive('bgHeader', Header);

    function Header(){
      var directive = {
        link: link,
        templateUrl: 'js/share/components/header/header.template.html',
        retrict: 'A',
        controller: 'HeaderController',
        controllerAs: 'vm',
        bindToController: true,
        scope: {
          spinLogo: '='
        }
      }

      function link (){
      }

      return directive;
    }
})();
