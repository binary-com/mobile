/**
 * @name Currency directive
 * @author Morteza Tavnarad
 * @contributors []
 * @since 09/05/2016
 * @copyright Binary Ltd
 */

(function(){
  'use strict';

  angular
    .module('binary.share.components.currency.directives')
    .directive('bgCurrency', Currency);

  function Currency() {
    var directive = {
      restrict: 'A',
      require: 'ngModel',
      link: link
    };

    function link(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + parseFloat(parseFloat(value).toFixed(2));
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value, 10);
      });

      scope.$watch(
          function(){
            return ngModel.$viewValue;
          },
          function(_value){
            var value = _value.split('.');
            if(value.length > 1){
              if(value[1].length > 2){
                ngModel.$viewValue = value[0] + "." + value[1].slice(0,2);
                ngModel.$render();
              }
            }
          });
    }

    return directive;

  }
})();
