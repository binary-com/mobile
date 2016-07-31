
/**
 * @name currencyDirective
 * @author Morteza Tavanarad
 * @contributors []
 * @since 07/27/2016
 * @copyright Binary Ltd
 * Directive to listen to currency event 
 * to update the currency value in session storage.
 */

angular
	.module('binary')
	.directive('currency', function(proposalService){
        return {
            restrict:'E',
            link: function(scope){

                scope.$on('currencies', function(e, response){
                    if(response && response.length > 0){
                        sessionStorage.currency = response[0];
                    }
                });

            }
        }
    });
