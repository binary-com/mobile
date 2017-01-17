/**
 * @name number directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/02/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.number.directives')
    .directive('bgNumber', BgNumber);

  function BgNumber(){
    var directive = {
      restrict: 'A',
      require: '?ngModel',
      link: link
    };

    function link(scope, element, attrs, ngModel){

      if(ngModel){
        ngModel.$formatters.push(function(modelValue){
          if(!modelValue){
            return modelValue;
          }
          return Number(modelValue);
        });

        ngModel.$parsers.push(function(viewValue){
          if(!viewValue){
            return viewValue;
          }
          return Number(viewValue);
        });
      }
    }

    return directive;
  }
})();
