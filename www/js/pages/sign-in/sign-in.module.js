/**
 * @name Singin Module
 * @author Morteza Tavanarad
 * @contributors []
 * @since 8/10/2016
 * @copyright Binary Ltd
 */

(function() {
    angular.module("binary.pages.signin", ["binary.pages.signin.components", "binary.pages.signin.controllers"]);

    angular.module("binary.pages.signin.controllers", []);

    angular.module("binary.pages.signin.components", ["binary.pages.signin.components.oauth"]);
})();
