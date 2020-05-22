/**
 * @name options service
 * @author Morteza Tavnarad
 * @contributors []
 * @since 08/31/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.trade.components.options.services").factory("optionsService", Options);

    function Options() {
        const factory = {};

        factory.get = function() {
            if (_.isEmpty(localStorage.options)) {
                return null;
            }

            return JSON.parse(localStorage.options);
        };

        factory.set = function(options) {
            if (!_.isEmpty(options)) {
                localStorage.options = JSON.stringify(options);
                return true;
            }

            return false;
        };

        return factory;
    }
})();
