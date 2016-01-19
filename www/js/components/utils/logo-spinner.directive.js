/**
 * @name logoSpinner
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/18/2016
 * @copyright Binary Ltd
 */

angular
    .module('binary')
    .directive('logoSpinner',
            function(){
                return{
                    restrict: "E",
                    replace: true,
                    scope: {
                        start: "="
                    },
                    templateUrl: "templates/components/utils/logo-spinner.template.html"
                }
            });
