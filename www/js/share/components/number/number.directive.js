/**
 * @name number directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/02/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.number.directives").directive("bgNumber", BgNumber);

    function BgNumber() {
        const directive = {
            restrict: "A",
            require : "?ngModel",
            link
        };

        function link(scope, element, attrs, ngModel) {
            if (ngModel) {
                // remove all default angular's validator for input[number]
                ngModel.$formatters = [];
                ngModel.$parsers = [];

                ngModel.$formatters.push(modelValue => {
                    if(ngModel.$isEmpty(modelValue)) {
                        return null;
                    }
                    return modelValue;
                });

                ngModel.$parsers.push(viewValue => {
                    if(ngModel.$isEmpty(viewValue)) {
                        return null;
                    }
                    return viewValue;
                });
            }
        }

        return directive;
    }
})();
