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
            function(){
                var factory = {};
                factory.google = {
                    trackView: function(_view){
                        if(typeof(analytics) !== "undefined"){
                            analytics.trackView(_view);
                        }
                    }
                }

                return factory;
            });

