/**
 * @name tradeCategory
 * @author Morteza Tavanarad
 * @contributors []
 * @since 02/12/2016
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.directive('tradeCategory',[
		'marketService',
		'config',
		'$ionicScrollDelegate',
		function(marketService, config, $ionicScrollDelegate) {
		return {
			restrict: 'E',
			templateUrl: 'templates/components/options/trade-category.template.html',
			link: function(scope, element) {
                scope.tradeCategories = config.tradeCategories;
                
                scope.$parent.$watch('scope.tradeTypes', function(_newValue, _oldValue){
                    var categories = Object.keys(_.groupBy(_newValue, 'category'));
                    scope.tradeCategories = _.filter(config.tradeCategories, function(o) { return categories.indexOf(o.value); });
                });

				scope.$parent.$watch('selected', function(value){
					if (value.tradeType) {
                        var tradeTypeObj = _.find(config.tradeTypes, ['value', value.tradeType]);
						scope.updateTradeType(tradeTypeObj.category);
					}
				}, true);


				scope.updateTradeType = function(_tradeCategory) {
                    var tradeType = _.find(config.tradeTypes, ['category', _tradeCategory]);
					scope.$parent.selected.tradeType = tradeType.value;
                    scope.$parent.selected.tradeCategory = _tradeCategory;

					scope.$parent.displayDigits = false;
					scope.$parent.hideDigit = '';
                    
                    if (tradeType.digits === true) {
                        if(_tradeCategory == "OVER/UNDER"){
                            if(scope.$parent.selected.digit == 9){
                                scope.$parent.selected.tradeType = "DIGITUNDER";
                            }
                            else{
                                scope.$parent.selected.tradeType = "DIGITOVER";
                            }
                        }

                        scope.$parent.displayDigits = true;
                        
                        // Set the digit and barrier for the first time that the digits are enabled
                        if(!scope.$parent.selected.barrier && !scope.$parent.selected.digit){
                            scope.$parent.selected.digit = 0;
                        }
                    }
				};

				scope.$parent.$watch(function(){
					var digitsVisible = angular.element(document).find('digits-option').hasClass('ng-hide');
					return digitsVisible;
				}, function(){
					$ionicScrollDelegate.resize();
				}, false);
			}
		};
	}]);
