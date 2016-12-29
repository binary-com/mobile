/**
 * @name analyticsService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 07/17/2016
 * @copyright Binary Ltd
 * Send information to all analytics services
 */

angular
    .module('binary')
    .factory('analyticsService',
            function(accountService){
                var factory = {};
                factory.google = {
                    addUser: function(){
                      var user = accountService.getDefault();
                      var userId = user && user.id ? user.id : null;
                      window.ga.setUserId(userId);
                    },
                    trackView: function(_view){
                        if(typeof(ga) !== "undefined"){
                            this.addUser();
                            ga.trackView(_view);
                        }
                    },
                    trackEvent: function(market, contractType, symbole, payout){
                        if(typeof(ga) !== "undefined"){
                            this.addUser();
                            ga.trackEvent(market, contractType, symbole, payout);
                        }
                    }
                };

                factory.amplitude = {
                    logEvent: function(title, data){
                        if(amplitude !== "undefined"){
                            amplitude.logEvent(title, data);
                        }
                    }
                }

                return factory;
            });

