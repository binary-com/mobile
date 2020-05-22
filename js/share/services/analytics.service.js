/**
 * @name analyticsService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 07/17/2016
 * @copyright Binary Ltd
 * Send information to all analytics services
 */

angular.module("binary").factory("analyticsService", accountService => {
    const factory = {};
    factory.google = {
        addUser() {
            const user = accountService.getDefault();
            const userId = user && user.id ? user.id : null;
            window.ga.setUserId(userId);
        },
        trackView(_view) {
            if (typeof ga !== "undefined") {
                this.addUser();
                ga.trackView(_view);
            }
        },
        trackEvent(market, contractType, symbole, payout) {
            if (typeof ga !== "undefined") {
                this.addUser();
                ga.trackEvent(market, contractType, symbole, payout);
            }
        }
    };

    return factory;
});
