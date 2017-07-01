/**
 * @name cleanupService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 12/22/2015
 * @copyright Binary Ltd
 *
 */

angular.module("binary").service("cleanupService", function($translate, proposalService) {
    this.run = function() {
        proposalService.forget();
    };
});
