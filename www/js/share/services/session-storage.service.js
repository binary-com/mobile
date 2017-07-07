/**
 * @name session-storage service
 * @author Morteza Tavanarad
 * @contributors []
 * @since 03/24/2017
 * @copyright Binary Ltd
 *
 */

(function() {
    angular.module("binary").factory("sessionStorageService", SessionStorage);

    function SessionStorage() {
        const factory = {};

        factory.getItem = function(itemName) {
            const item = sessionStorage.getItem(itemName);
            if (_.isEmpty(item) || item === "undefined") {
                return null;
            }
            return item;
        };

        return factory;
    }
})();
