
/**
 * @name ping directive
 * @author Morteza Tavanarad
 * @contributors []
 * @since 08/02/2016
 * @copyright Binary Ltd
 * Directive to ping server for keeping alive the connection
 */

angular
	.module('binary')
	.directive('ping', function(websocketService, $timeout){
		return{
            restrict: 'E',
            link: function(scope){
                function init(){
                    ping();
                }

                function ping(){
                    websocketService.sendRequestFor.ping();

                    $timeout(ping, 60000);
                }

                init();
            }
        };
    });
