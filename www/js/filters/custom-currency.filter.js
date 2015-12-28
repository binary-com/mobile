/**
 * @name contractSummary
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/28/2015
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.filter('customCurrency', ["$filter", function ($filter) {       
	    return function(amount, currencySymbol){
	        var currency = $filter('currency');         

	        if(amount < 0){
	            return currency(amount, currencySymbol).replace("(", "-").replace(")", ""); 
	        }

	        return currency(amount, currencySymbol);
	    };
	}]);