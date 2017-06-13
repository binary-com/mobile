/**
 * @name big number Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 06/09/2017
 * @copyright Binary Ltd
 */

(function() {
  'use strict';

  angular
    .module('binary.share.components.big-number.directives')
    .directive('bgBigNumber', BigNumber);

  BigNumber.$inject = [];

  function BigNumber(){
    var directive = {
      restrict: 'A',
      require: '?ngModel',
      link: link
    };

    function link(scope, element, attr, ctrl){
      if(ctrl){

        ctrl.$formatters.push(function(modelValue){
          if(angular.isDefined(modelValue) && _.isEmpty(modelValue.toString())){
            return null;
          }
          return modelValue;
        });

        ctrl.$parsers.push(function(viewValue){
          if(!viewValue){
            return null;
          }
          return viewValue;
        });


        var minVal;
        var maxVal;

        if (angular.isDefined(attr.min) || attr.ngMin) {
          ctrl.$validators.min = function(value) {
          return ctrl.$isEmpty(value) || angular.isUndefined(minVal) || value >= minVal;
          };

          attr.$observe('min', function(val) {
            minVal = val;
            ctrl.$validate();
          });
        }

        if (angular.isDefined(attr.max) || attr.ngMax) {
          ctrl.$validators.max = function(value) {
            return ctrl.$isEmpty(value) || angular.isUndefined(maxVal) || value <= maxVal;
          };

          attr.$observe('max', function(val) {
            maxVal = val;
            ctrl.$validate();
          });
        }

      }
    }

    return directive;
  }


})();
