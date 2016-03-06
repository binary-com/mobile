/**
 * @name stringToNumber
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/29/2015
 * @copyright Binary Ltd
 */


angular
	.module('binary')
	.directive('stringToNumber', function() {
	  return {
	    require: 'ngModel',
	    link: function(scope, element, attrs, ngModel) {
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
	  };
	});
