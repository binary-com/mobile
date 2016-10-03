/**
 * @name statement module
 * @author Nazanin Reihani Haghighi
 * @contributors []
 * @since 08/14/2016
 * @copyright Binary Ltd
 */

(function() {
    'use strict';

    angular
        .module('binary.pages.statement', [
            'binary.pages.statement.controllers',
            'binary.pages.statement.directives',
            'binary.pages.statement.filters'
        ]);

    angular
        .module('binary.pages.statement.controllers', []);

    angular
        .module('binary.pages.statement.directives', []);

    angular
        .module('binary.pages.statement.filters', []);
})();
