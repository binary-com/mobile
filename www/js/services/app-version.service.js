/**
 * @name appVersionService
 * @author Morteza Tavanarad
 * @contributors []
 * @since 01/20/2016
 * @copyright Binary Ltd
 */

angular
	.module('binary')
	.factory('appVersionService',
            function($http){
                var appVersion = {};

                function getAppVersion(){
                    return $http.get('js/config.json');
                }

                appVersion.getAppVersion = getAppVersion;

                return appVersion;

            });
