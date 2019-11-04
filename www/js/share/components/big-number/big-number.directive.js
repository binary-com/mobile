/**
 * @name big number Controller
 * @author Morteza Tavanarad
 * @contributors []
 * @since 06/09/2017
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.share.components.big-number.directives").directive("bgBigNumber", BigNumber);

    BigNumber.$inject = [];

    function BigNumber() {
        const directive = {
            restrict: "A",
            require : "?ngModel",
            link
        };

        function link(scope, element, attr, ctrl) {
            if (ctrl) {
                ctrl.$formatters.push(modelValue => {
                    if (angular.isDefined(modelValue) && _.isEmpty(modelValue.toString())) {
                        return null;
                    }
                    return modelValue;
                });

                ctrl.$parsers.push(viewValue => {
                    if (!viewValue) {
                        return null;
                    }
                    return viewValue;
                });

                let minVal;
                let maxVal;

                if (angular.isDefined(attr.min) || attr.ngMin) {
                    ctrl.$validators.min = value =>
                        ctrl.$isEmpty(value) || angular.isUndefined(minVal) || value >= parseFloat(minVal);

                    attr.$observe("min", val => {
                        minVal = val;
                        ctrl.$validate();
                    });
                }

                if (angular.isDefined(attr.max) || attr.ngMax) {
                    ctrl.$validators.max = value =>
                        ctrl.$isEmpty(value) || angular.isUndefined(maxVal) || value <= parseFloat(maxVal);

                    attr.$observe("max", val => {
                        maxVal = val;
                        ctrl.$validate();
                    });
                }
            }
        }

        return directive;
    }
})();
